import { Game, PlayedGame, Player, getDb } from "@libs/Store";
import { GoogleSheetsService } from "./GoogleSheetsService";
import { error, toMap, toMapBy } from "@libs/Common";
import {
  findIndex,
  findLastIndex,
  isNil,
  isString,
  takeRight,
  uniq,
} from "lodash";
import { Table } from "./types";
import { isEqual } from "date-fns";
const EMPTY_ROW: (string | number | null | undefined)[] = [];
const DEFAULT_GROUP = "Все";

const getDocumentTitle = (group: string) => `HomeBG-${group}`;
const MAIN_SHEET_TITLE = `Игры`;
enum TableFields {
  Id = "ид:",
  Data = "Дата:",
  Modified = "Обновлена:",
  GameName = "Игра:",
}

class GoogleSyncService {
  private gSheets = new GoogleSheetsService();

  public async sync() {
    const db = await getDb();
    const groups = await db.getAll("group");
    const players = await db.getAll("player");
    const games = await db.getAll("game");

    const playedGames = await db.getAll("playedGame");
    const localPlayedGamesMap = toMap(playedGames, "id");

    const gamesMap = toMap(games, "id");
    const gamesMapByName = toMap(games, "name");

    const playersMap = toMap(players, "id");
    const playersMapByName = toMap(players, "name");

    for (const group of groups) {
      const groupId = group.id;

      const playersMapByNameInGroup = toMapBy(
        players,
        (p) => p.groups?.[groupId]?.name
      );

      const groupPlayedGames = playedGames.filter((pg) =>
        pg.groupsIds?.includes(group.id)
      );

      const playersToUpdate = new Set<number>();
      groupPlayedGames.forEach((pg) => {
        pg.result.forEach(({ playerId }) => {
          playersToUpdate.add(playerId);
        });
      });

      await this.gSheets.ensureAuth();

      let spreadsheetId: string;
      if (!group.documentId) {
        const ss = await this.gSheets.createSpreadsheet(
          getDocumentTitle(group.name),
          [MAIN_SHEET_TITLE]
        );
        const sheetId = ss.sheets?.[0].properties?.sheetId;
        if (!ss.spreadsheetId || isNil(sheetId)) {
          error("Unexpected answer on createSpreadsheet:", ss);
          return;
        }

        await db.put("group", { ...group, documentId: ss.spreadsheetId });

        spreadsheetId = ss.spreadsheetId;
      } else {
        spreadsheetId = group.documentId;
      }

      // -- getUpdates
      const remoteUpdates: { old?: TableGame; new: PlayedGame }[] = [];
      const localUpdates: { new: RemotePlayedGame }[] = [];

      const remoteIds = new Set<string>();
      const fullRemoteTable = await this.readAll(spreadsheetId);
      const gamesTables = this.splitToGames(fullRemoteTable);

      for (let i = 0; i < gamesTables.length; i++) {
        // go from end so that ignore earlier items if id are the same
        const gameTable = gamesTables[gamesTables.length - 1 - i];

        const remote = this.parseGameTable(gameTable.data);
        if (!remote) return;

        if (remoteIds.has(remote.id)) continue;

        remoteIds.add(remote.id);

        const local = localPlayedGamesMap.get(remote.id);

        if (!local) {
          localUpdates.push({ new: remote });
          continue;
        }

        if (isEqual(local.modifiedAt, remote.modifiedAt)) continue;

        if (local.modifiedAt > remote.modifiedAt) {
          remoteUpdates.push({ new: local, old: gameTable });
          continue;
        }

        if (local.modifiedAt < remote.modifiedAt) {
          localUpdates.push({ new: remote });
        }
      }

      groupPlayedGames.forEach((g) => {
        if (!remoteIds.has(g.id)) {
          remoteUpdates.push({ new: g });
        }
      });

      const updateRemote = async (): Promise<string | undefined> => {
        const updates: Table = [];

        remoteUpdates.forEach((upd) => {
          updates.push(
            [],
            ...this.toGameTable(upd.new, gamesMap, playersMap, groupId)
          );
        });

        if (!updates.length) return;

        const spreadsheet = await this.gSheets.get(spreadsheetId);
        const sheetId = spreadsheet.sheets?.[0].properties?.sheetId;

        if (!sheetId) {
          error("Cannot get sheetId for update.");
          return;
        }

        await this.gSheets.writeData(
          spreadsheetId,
          sheetId,
          0,
          fullRemoteTable.length,
          updates
        );
        console.log("Remote updates", {
          spreadsheetId,
          sheetId,
          offset: fullRemoteTable.length,
          updates,
        });
        // TODO: remove old data (task:6)
      };

      const updateLocal = async function (): Promise<void> {
        // updating player's aliases
        await Promise.all(
          Array.from(playersToUpdate, (playerId) => {
            const player = playersMap.get(playerId);

            if (player?.groups?.[groupId]?.name) {
              return;
            }

            if (!player) throw new Error("player should exist.");
            const updatedPlayer = {
              ...player,
              groups: {
                ...player.groups,
                [groupId]: { name: player.name },
              },
            };
            console.log("Local updates: player alias:", updatedPlayer);

            return db.put("player", updatedPlayer);
          })
        );
        // --

        const playedGamesUpdates: PlayedGame[] = [];
        const gamesByName = new Map();

        for (const game of gamesMap.values()) {
          gamesByName.set(game.name, game);
        }

        for (const { new: remote } of localUpdates) {
          let gameId = gamesMapByName.get(remote.gameName)?.id;

          if (!gameId) {
            gameId = await db.add("game", { name: remote.gameName });
            console.log("Local updates: new game:", remote.gameName);
          }

          const result: PlayedGame["result"] = [];
          for (const remoteRes of remote.result) {
            const player = playersMapByNameInGroup.get(remoteRes.playerName);

            if (player) {
              result.push({ playerId: player.id, place: remoteRes.place });
              continue;
            }

            const notLinkedPlayer = playersMapByName.get(remoteRes.playerName);

            if (!notLinkedPlayer) {
              const newPlayer = {
                name: remoteRes.playerName,
                groups: { [groupId]: { name: remoteRes.playerName } },
              };
              const playerId = await db.add("player", newPlayer);
              console.log("Local updates: new player:", newPlayer);

              result.push({ playerId, place: remoteRes.place });
              continue;
            }

            // TODO: task 7
            const newPlayer = {
              name: `${DEFAULT_GROUP}: ${remoteRes.playerName}`,
              groups: { [groupId]: { name: remoteRes.playerName } },
            };
            const playerId = await db.add("player", newPlayer);
            console.log("Local updates: new player:", newPlayer);

            result.push({ playerId, place: remoteRes.place });
          }

          const local = localPlayedGamesMap.get(remote.id);

          playedGamesUpdates.push({
            id: remote.id,
            date: remote.date,
            modifiedAt: remote.modifiedAt,
            gameId: gameId,
            result,
            groupsIds: uniq([...(local?.groupsIds ?? []), groupId]),
          });
        }

        await Promise.all(
          playedGamesUpdates.map((g) => db.put("playedGame", g))
        );

        if (playedGamesUpdates.length)
          console.log("Local updates: played games:", playedGamesUpdates);
      };

      await updateRemote();
      await updateLocal();
    }
  }

  private splitToGames(table: Table) {
    const remotePlayedGames: TableGame[] = [];

    let startIdx = 0;
    while (startIdx >= 0 && startIdx < table.length) {
      startIdx = findIndex(table, (row) => !!row[0], startIdx);

      let endIdxEx = findIndex(table, (row) => !row[0], startIdx + 1);
      endIdxEx = endIdxEx === -1 ? table.length : endIdxEx;

      const gameTable = table.slice(startIdx, endIdxEx);
      remotePlayedGames.push({ startIdx, data: gameTable });

      startIdx = endIdxEx;
    }

    return remotePlayedGames;
  }

  private async readAll(spreadsheetId: string) {
    const table: Table = [];
    const limit = 10;
    const emptyLinesToStop = 5;

    for (
      let offset = 0;
      !table.length ||
      takeRight(table, emptyLinesToStop).some((r) => !!r.length);
      offset += limit
    ) {
      const data = await this.readPart(spreadsheetId, offset, limit);

      if (!data?.length) break;

      if (data.length === limit) {
        table.push(...data);
      }

      // gapi cuts array if end of request are empty rows
      // we check condition of end requesting if it's false we fill gap with empty rows
      if (data.length < limit) {
        if (limit - data.length >= emptyLinesToStop) {
          table.push(...data);
          break;
        }

        const res = [...data];

        for (let i = data.length; i < limit; i++) {
          res.push(EMPTY_ROW);
        }

        table.push(...res);
      }
    }

    const lastDatRowIndex = findLastIndex(table, (row) => !!row.length);
    table.splice(lastDatRowIndex + 1);

    return table;
  }

  private async readPart(spreadsheetId: string, offset: number, limit: number) {
    return this.gSheets.readData(
      spreadsheetId,
      `${MAIN_SHEET_TITLE}!A${offset + 1}:B${offset + limit}`
    );
  }

  private toGameTable(
    play: PlayedGame,
    gamesMap: Map<number, Game>,
    playersMap: Map<number, Player>,
    groupId: number
  ): Table {
    return [
      [TableFields.Id, play.id],
      [TableFields.Data, play.date.toISOString()],
      [TableFields.Modified, play.modifiedAt.toISOString()],
      [TableFields.GameName, gamesMap.get(play.gameId)?.name ?? ""],
      ...play.result.map((res) => {
        const player = playersMap.get(res.playerId);
        if (!player) throw new Error("player should exist.");

        return [res.place, player.groups?.[groupId]?.name ?? player.name];
      }),
    ];
  }

  private parseGameTable(table: Table): RemotePlayedGame | undefined {
    const id = isString(table[0][1]) ? table[0][1] : undefined;
    if (!id) {
      error("Invalid id", table);
      return;
    }

    const date = new Date(String(table[1][1]));
    if (isNaN(date.getTime())) {
      error("Invalid date", table);
      return;
    }

    const modifiedAt = new Date(String(table[2][1]));
    if (isNaN(modifiedAt.getTime())) {
      error("Invalid modified date", table);
      return;
    }

    const gameName = isString(table[3][1]) ? table[3][1] : undefined;
    if (!gameName) {
      error("Invalid game", table);
      return;
    }
    const result: { playerName: string; place: number }[] = [];

    for (const row of table.slice(4)) {
      const place = Number(row[0]);

      if (isNaN(place)) {
        error(`Invalid place '${row[0]}' in row`, row, table);
        return;
      }

      const playerName = row[1];
      if (!playerName || !isString(playerName)) {
        error(`Invalid player name '${playerName}' in row`, row, table);
        return;
      }

      result.push({
        place,
        playerName,
      });
    }

    return {
      id,
      date,
      modifiedAt,
      gameName,
      result,
    };
  }
}

export const GoogleSync = new GoogleSyncService();

interface RemotePlayedGame {
  id: string;
  date: Date;
  modifiedAt: Date;
  gameName: string;
  result: {
    place: number;
    playerName: string;
  }[];
}

interface TableGame {
  startIdx: number;
  data: Table;
}

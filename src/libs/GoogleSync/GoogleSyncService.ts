import { getDb } from "@libs/Store";
import { GoogleSheetsService } from "./GoogleSheetsService";
import { Table } from "./Sheet";
import { error, toMap } from "@libs/Common";

const DEFAULT_GROUP = "Все";
const SHEET_TITLE = "Игры";

const getDocumentTitle = (group: string) => `HomeBG-${group}`;
const getSheetTitle = () => `Игры`;

class GoogleSyncService {
  private gSheets = new GoogleSheetsService();

  public async sync() {
    const db = await getDb();
    const games = toMap(await db.getAll("game"));
    const players = toMap(await db.getAll("player"));
    const playedGames = await db.getAll("playedGame");

    let group = (await db.getAll("group")).at(0);
    if (!group) {
      await db.add("group", { name: DEFAULT_GROUP, documentName: SHEET_TITLE });
      group  = (await db.getAll("group")).at(0) 
    }

    const tableGames = playedGames
      .map((play) => {
        return [
          ["ид:", play.id],
          ["Дата:", play.date.toLocaleDateString()],
          ["Обновлена:", play.modifiedAt.toISOString()],
          ["Игра:", games.get(play.gameId)?.name ?? ""],
          ...play.result.map((res) => [
            res.place,
            players.get(res.playerId)?.name ?? "",
          ]),
        ];
      });

    const mergedGames = tableGames.reduce<Table>((acc, game) => {
      acc.push(...game, []);
      return acc;
    }, []);

    if (!group)
      return error("Unexpected error: group should exist by id:", group);

    await this.gSheets.ensureAuth();

    if (!group.documentId) {
      const sheet = await this.gSheets.createSheet(
        getDocumentTitle(group.name),
        getSheetTitle()
      );

      if (!sheet) return;

      await sheet.write(0, 0, mergedGames);

      await db.put("group", { ...group, documentId: sheet?.spreadsheetId });

      return;
    }

    // считать существующий и записать новые
    console.log("read", group.documentId);
  }
}

export const GoogleSync = new GoogleSyncService();

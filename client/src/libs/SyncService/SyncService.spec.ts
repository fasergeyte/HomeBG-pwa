import {
  closeDb,
  DataBase,
  Game,
  getDb,
  PlayedGame,
  Player,
} from "@libs/Store";
import { sync } from "./SyncService";

import { apiSyncPost } from "@libs/Api/api";
import { SyncRequest } from "bg-games-api";

vitest.mock("@libs/Api/api", () => ({
  apiSyncPost: vitest.fn().mockReturnValue(Promise.resolve()),
}));

const apiSyncPostMock = vitest.mocked(apiSyncPost);

describe("SyncService", () => {
  let games: Game[] = [];
  let players: Player[] = [];
  let playedGames: PlayedGame[] = [];
  let db: DataBase;

  beforeEach(async () => {
    db = await getDb();

    games = (await Promise.all(
      [
        await db.add("game", {
          id: "игра0",
          name: "игра0",
          modifiedAt: new Date(2024, 0, 1),
        }),
        await db.add("game", {
          id: "игра1",
          name: "игра1",
          modifiedAt: new Date(2024, 0, 2),
        }),
      ].map((id) => db.get("game", id))
    )) as Game[];

    players = (await Promise.all(
      [
        await db.add("player", {
          id: "игрок0",
          name: "игрок0",
          modifiedAt: new Date(2024, 0, 1),
        }),
        await db.add("player", {
          id: "игрок1",
          name: "игрок1",
          modifiedAt: new Date(2024, 0, 1),
        }),
        await db.add("player", {
          id: "игрок2",
          name: "игрок2",
          modifiedAt: new Date(2024, 0, 2),
        }),
      ].map((id) => db.get("player", id))
    )) as Player[];

    playedGames = (await Promise.all(
      [
        await db.add("playedGame", {
          id: "pg-0",
          date: new Date(2024, 0, 1),
          gameId: games[0].id,
          modifiedAt: new Date(2024, 0, 1),
          result: [
            { place: 1, playerId: players[0].id },
            { place: 2, playerId: players[1].id },
          ],
        }),
        await db.add("playedGame", {
          id: "pg-1",
          date: new Date(2024, 0, 2),
          gameId: games[1].id,
          modifiedAt: new Date(2024, 0, 2),
          result: [
            { place: 2, playerId: players[0].id },
            { place: 1, playerId: players[1].id },
            { place: 3, playerId: players[2].id },
          ],
        }),
        await db.add("playedGame", {
          id: "pg-2",
          date: new Date(2024, 0, 3),
          gameId: games[1].id,
          modifiedAt: new Date(2024, 0, 3),
          result: [
            { place: 1, playerId: players[0].id },
            { place: 2, playerId: players[1].id },
            { place: 3, playerId: players[2].id },
          ],
        }),
        await db.add("playedGame", {
          id: "pg-3",
          date: new Date(2024, 0, 1),
          gameId: games[0].id,
          modifiedAt: new Date(2024, 0, 2),
          result: [
            { place: 1, playerId: players[0].id },
            { place: 2, playerId: players[1].id },
          ],
        }),
      ].map((id) => db.get("playedGame", id))
    )) as PlayedGame[];
  });

  afterEach(() => {
    closeDb();
  });
  it("when the first sync all data are sent and meta is filled", async () => {
    await sync();
    const expected: SyncRequest = {
      games: games,
      players: players,
      playedGames: playedGames,
      lastSync: 0,
    };
    expect(apiSyncPostMock).toBeCalledWith(expected);
    // добавить проверку на обновление мета
  });

  it("only data after lastSync is sent", async () => {
    await db.add("meta", {
      id: "1",
      syncDate: new Date(2024, 0, 1, 23, 0),
    });
    await sync();
    const expected: SyncRequest = {
      games: [games[1]],
      players: [players[2]],
      playedGames: [playedGames[1], playedGames[2]],
      lastSync: 0,
    };
    expect(apiSyncPostMock).toBeCalledWith(expected);
  });
});

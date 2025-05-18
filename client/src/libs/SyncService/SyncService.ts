import { getDb } from "@libs/Store";
import type { SyncRequest } from "bg-games-api";
import { apiSyncPost } from "@libs/Api/api";

export async function sync() {
  const reqData = await getSyncRequestData();
  await apiSyncPost(reqData);
}

async function getSyncRequestData(): Promise<SyncRequest> {
  const db = await getDb();
  const meta = (await db.getAll("meta")).at(0);
  const lastSyncDate = meta?.syncDate ?? new Date(0);

  const gamesP = db.getAllNewerThan("game", lastSyncDate);
  const playersP = db.getAllNewerThan("player", lastSyncDate);
  const playedGamesP = db.getAllNewerThan("playedGame", lastSyncDate);

  return {
    lastSync: lastSyncDate.getTime(),
    games: await gamesP,
    players: await playersP,
    playedGames: await playedGamesP,
  };
}

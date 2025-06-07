import type { Game, PlayedGame, Player, SyncRequest } from "bg-games-api";
import { findAllModifiedAfter, findOne, update, User } from "../db/db";

export async function syncData(
  req: SyncRequest,
  user: User
): Promise<SyncRequest> {
  const gamesToUpdate: Game[] = [];

  const qGameSync = req.games.map(async (reqGame) => {
    const dbGame: Game = await findOne("game", { id: reqGame.id });
    if (!dbGame || reqGame.modifiedAt > dbGame.modifiedAt) {
      gamesToUpdate.push(reqGame);
    }
  });

  const playersToUpdate: Player[] = [];

  const qPlayerSync = req.players.map(async (reqPlayer) => {
    const dbPlayer: Player = await findOne("player", { id: reqPlayer.id });
    if (!dbPlayer || reqPlayer.modifiedAt > dbPlayer.modifiedAt) {
      playersToUpdate.push(reqPlayer);
    }
  });

  await Promise.all([
    Promise.all(qGameSync).then(() => update("game", gamesToUpdate)),
    Promise.all(qPlayerSync).then(() => update("player", playersToUpdate)),
  ]);

  const playedGamesToUpdate: PlayedGame[] = [];

  const qPlayedGameSync = req.playedGames.map(async (reqPlayedGame) => {
    const dbPlayedGame: PlayedGame = await findOne("playedGame", {
      id: reqPlayedGame.id,
    });
    if (!dbPlayedGame || reqPlayedGame.modifiedAt > dbPlayedGame.modifiedAt) {
      playedGamesToUpdate.push(reqPlayedGame);
    }
  });

  const pResGames = findAllModifiedAfter("game", req.lastSync);
  const pResPlayedGames = findAllModifiedAfter("playedGame", req.lastSync);
  const pResPlayers = findAllModifiedAfter("player", req.lastSync);

  return {
    games: await pResGames,
    players: await pResPlayers,
    playedGames: await pResPlayedGames,
    lastSync: new Date().getTime(),
  };
}

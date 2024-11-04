import { PlayedGame, Rule, getDb } from "@libs/Store";
import { checkGroupRule } from "./utils";

export async function applyGroupRule(rule: Rule, groupId: number) {
  const db = await getDb();
  const games = await db.getAll("playedGame");

  const updates: PlayedGame[] = [];

  games.forEach((game) => {
    const playerIds = game.result.map((res) => res.playerId);

    if (!checkGroupRule(rule, { playerIds })) return;

    const groupsIds = game.groupsIds
      ? game.groupsIds.concat([groupId])
      : [groupId];

    updates.push({ ...game, groupsIds });
  });

  return Promise.all(updates.map(async (game) => db.put("playedGame", game)));
}

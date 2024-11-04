import { Group, Rule } from "@libs/Store";

export function getGroupsForGame(
  groups: Group[] | undefined,
  gameParams: {
    playerIds: number[];
  }
) {
  return groups?.filter((g) => {
    const isMatched = g.rules?.some((r) => checkGroupRule(r, gameParams));

    return !!isMatched;
  });
}

export function checkGroupRule(
  rule: Rule,
  gameParams: {
    playerIds: number[];
  }
) {
  if (rule.type === "players") {
    const hasAll = rule.playerIds.every((id) =>
      gameParams.playerIds.some((playerId) => playerId === id)
    );

    if (hasAll) {
      return true;
    }
  }
  return false;
}

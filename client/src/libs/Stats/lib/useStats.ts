import { useStoreGetAll } from "@libs/Store";
import { PickerRangeValue } from "@mui/x-date-pickers/internals";
import { useMemo } from "react";
import { isAfter, isBefore, startOfDay } from "date-fns";
import { isNil } from "lodash";

interface GameStats {
  /**
   * Общее количество партий
   */
  total: number;
  /**
   * Первое место
   */
  wins: number;
  /**
   * Не первое место
   */
  defeats: number;
}

interface PlayersStats {
  total: GameStats;
  gamesStats: Record<string, GameStats>;
}

export function useStats(
  playerId: string | undefined,
  filter?: { dataRange?: PickerRangeValue }
) {
  const startDate = isNil(filter?.dataRange?.[0])
    ? null
    : startOfDay(filter.dataRange[0]);
  const endDate = isNil(filter?.dataRange?.[1])
    ? null
    : startOfDay(filter.dataRange[1]);

  const { data: playedGamesAll } = useStoreGetAll("playedGame");

  const playedGames = playedGamesAll?.filter((g) => {
    if (!isNil(startDate) && isBefore(g.date, startDate)) {
      return false;
    }

    if (!isNil(endDate) && isAfter(g.date, endDate)) {
      return false;
    }

    return true;
  });

  return useMemo(
    () =>
      playedGames?.reduce<PlayersStats>(
        (stats, g) => {
          const result = g.result.find((item) => item.playerId === playerId);
          if (!result) return stats;

          const gameStats =
            stats.gamesStats[g.gameId] ??
            (stats.gamesStats[g.gameId] = { total: 0, wins: 0, defeats: 0 });

          const totalStats = stats.total;

          totalStats.total = 1 + totalStats.total;
          gameStats.total = 1 + gameStats.total;

          if (result.place === 1) {
            totalStats.wins = 1 + totalStats.wins;
            gameStats.wins = 1 + gameStats.wins;
          } else {
            totalStats.defeats = 1 + totalStats.defeats;
            gameStats.defeats = 1 + gameStats.defeats;
          }

          return stats;
        },
        {
          total: { total: 0, wins: 0, defeats: 0 },
          gamesStats: {},
        }
      ),
    [playedGames, playerId]
  );
}

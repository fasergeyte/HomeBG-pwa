import { useStoreGetAll } from "@libs/Store";
import { useMemo } from "react";

interface GameStats {
  total: number;
  wins: number;
  defeats: number;
}

interface PlayersStats {
  total: GameStats;
  gamesStats: Record<number, GameStats>;
}

export function useStats(playerId: number | undefined) {
  const { data: playedGames } = useStoreGetAll("playedGame");
  return useMemo(
    () =>
      playedGames?.reduce<PlayersStats>(
        (stats, g) => {
          const result = g.result.find((id) => id.playerId === playerId);
          if (!result) return stats;

          const gameStats =
            stats.gamesStats[g.id] ??
            (stats.gamesStats[g.id] = { total: 0, wins: 0, defeats: 0 });

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

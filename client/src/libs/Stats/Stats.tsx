import { Box } from "@mui/material";
import { PlayersStatsCard } from "./PlayersStatsCard";
import { UrlParams } from "@libs/Routing";
import { useParams } from "react-router";
import { useStats } from "./lib/useStats";
import { useStoreGetAllAsMap } from "@libs/Store";

export function Stats() {
  const params = useParams<UrlParams<"playerStats">>();
  const playerId = params.id;
  const { map: gamesMap } = useStoreGetAllAsMap("game");
  const stats = useStats(playerId);

  return (
    <Box sx={{ p: 1, overflow: "scroll" }}>
      {stats && (
        <PlayersStatsCard
          key={"all"}
          title="Все игры"
          total={stats.total.total}
          wins={stats.total.wins}
          defeats={stats.total.defeats}
        />
      )}
      {stats &&
        Object.entries(stats.gamesStats).map(([gameId, gameStats]) => (
          <PlayersStatsCard
            key={gameId}
            title={gamesMap?.get(gameId)?.name ?? ""}
            total={gameStats.total}
            wins={gameStats.wins}
            defeats={gameStats.defeats}
          />
        ))}
    </Box>
  );
}

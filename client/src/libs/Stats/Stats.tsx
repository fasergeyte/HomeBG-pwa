import { Box, Card, Typography } from "@mui/material";
import { PlayersStatsCard } from "./PlayersStatsCard";
import { UrlParams } from "@libs/Routing";
import { useParams } from "react-router";
import { useStats } from "./lib/useStats";
import { useStoreGet, useStoreGetAllAsMap } from "@libs/Store";
import { DateRangePicker } from "@mui/x-date-pickers-pro";
import { useState } from "react";
import { PickerRangeValue } from "@mui/x-date-pickers/internals";

export function Stats() {
  const params = useParams<UrlParams<"playerStats">>();
  const playerId = params.id;
  const { data: player } = useStoreGet("player", playerId);
  const { map: gamesMap } = useStoreGetAllAsMap("game");
  const [dateRange, setDateRange] = useState<PickerRangeValue>([null, null]);

  const stats = useStats(playerId, { dataRange: dateRange });

  return (
    <Box sx={{ p: 1, overflow: "scroll" }}>
      <Card sx={{ mb: 1, p: 1 }}>
        <Typography variant="h5">{player?.name}</Typography>
        <DateRangePicker
          label={"Период"}
          sx={{ width: 1 }}
          value={dateRange}
          onChange={(value) => setDateRange(value)}
          format="dd.MM.yyyy"
        />
      </Card>
      {stats && (
        <PlayersStatsCard
          key={"all"}
          title="Все игры"
          total={stats.total.total}
          wins={stats.total.wins}
        />
      )}
      {stats &&
        Object.entries(stats.gamesStats).map(([gameId, gameStats]) => (
          <PlayersStatsCard
            key={gameId}
            title={gamesMap?.get(gameId)?.name ?? ""}
            total={gameStats.total}
            wins={gameStats.wins}
          />
        ))}
    </Box>
  );
}

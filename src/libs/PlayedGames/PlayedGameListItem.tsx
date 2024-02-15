import { PlayedGame, useStoreGetAllAsMap } from "@libs/Store";
import { Card, Chip, Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { useMemo } from "react";

interface PlayedGameListItemProps {
  playedGame: PlayedGame;
  onClick?: (id: string) => void;
}

export function PlayedGameListItem(props: PlayedGameListItemProps) {
  const { onClick, playedGame } = props;
  const { map: playersMap } = useStoreGetAllAsMap("player");
  const { map: gamesMap } = useStoreGetAllAsMap("game");
  const game = gamesMap?.get(playedGame.gameId);
  const players = useMemo(
    () =>
      playedGame.result.map(
        ({ place, playerId }) => `${place}. ${playersMap?.get(playerId)?.name}`
      ),
    [playedGame.result, playersMap]
  );
  return (
    <Card
      key={playedGame.id}
      sx={{ mb: 1, p: 1 }}
      onClick={() => onClick?.(playedGame.id)}
    >
      <Stack direction="column">
        <Stack direction="row">
          <Chip
            sx={{ width: "70px" }}
            label={format(playedGame?.date, "d MMM")}
          />
          <Typography ml={1} variant="h6">
            {game?.name}
          </Typography>
        </Stack>
        <Typography variant="body1">{players.join(", ")}</Typography>
      </Stack>
    </Card>
  );
}

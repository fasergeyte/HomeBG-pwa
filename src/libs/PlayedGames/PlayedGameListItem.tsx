import { PlayedGame, useStoreGetAllAsMap } from "@libs/Store";
import { Box, Chip, ListItemButton, Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { useMemo } from "react";

interface PlayedGameListItemProps {
  playedGame: PlayedGame;
  onClick?: (id: number) => void;
}

export function PlayedGameListItem(props: PlayedGameListItemProps) {
  const { onClick, playedGame } = props;
  const { map: playersMap } = useStoreGetAllAsMap("player");
  const { map: gamesMap } = useStoreGetAllAsMap("game");
  const game = gamesMap?.get(playedGame.gameId);
  const players = useMemo(
    () =>
      playedGame.result.map(
        ({ place, playerId }) =>
          `${place}.\u00A0${playersMap?.get(playerId)?.name}`
      ),
    [playedGame.result, playersMap]
  );
  return (
    <>
      <ListItemButton
        sx={{
          p: 1,
          width: 1,
          my: 1 / 2,
          bgcolor: "background.paper",
        }}
        onClick={() => onClick?.(playedGame.id)}
      >
        <Box
          sx={{
            width: "calc(100%)",
          }}
        >
          <Stack direction="row">
            <Chip
              sx={{ width: "80px" }}
              label={format(playedGame?.date, "d MMM")}
            />
            <Typography
              ml={1}
              variant="h6"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {game?.name}
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {players.join(", ")}
          </Typography>
        </Box>
      </ListItemButton>
    </>
  );
}

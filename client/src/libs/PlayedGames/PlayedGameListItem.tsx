import { ContextMenu, ContextMenuItem } from "@libs/Common";
import { paths } from "@libs/Routing";
import { PlayedGame, useStoreDelete, useStoreGetAllAsMap } from "@libs/Store";
import { Box, Chip, ListItemButton, Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { memo, useMemo } from "react";
import { Link } from "react-router";

interface PlayedGameListItemProps {
  playedGame: PlayedGame;
}

export const PlayedGameListItemShell = memo(function PlayedGameListItemShell(
  props: PlayedGameListItemProps
) {
  const { playedGame } = props;

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
  const { mutateAsync: deletePlayedGame } = useStoreDelete("playedGame");

  const actions: ContextMenuItem<string>[] = [
    {
      label: "Удалить",
      action: (id) => deletePlayedGame(id),
    },
  ];
  return (
    <ContextMenu key={playedGame.id} id={playedGame.id} actions={actions}>
      <ListItemButton
        component={Link}
        to={paths.playedGameDialog.getUrl({ id: playedGame.id })}
        sx={{
          p: 1,
          width: 1,
          my: 1 / 2,
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            width: "calc(100%)",
          }}
        >
          <Stack direction="row" alignItems={"center"}>
            <Chip
              color="primary"
              sx={{ width: "70px" }}
              size={"small"}
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
          </ContextMenu>
  );
});

import { Box, Fab, List, Typography } from "@mui/material";
import { useStoreDelete, useStoreGetAll } from "@libs/Store";
import AddIcon from "@mui/icons-material/Add";
import { ContextMenu, ContextMenuItem } from "@libs/Common";
import { PlayedGameListItem } from "./PlayedGameListItem";
import { useMemo } from "react";
import { orderBy } from "lodash";
import { useNavigate } from "react-router-dom";
import { paths } from "@libs/Routing/paths";
import { PlayedGamesRouter } from "./PlayedGamesRouter";

export function PlayedGames() {
  const { data: playedGames } = useStoreGetAll("playedGame");
  const { mutateAsync: deletePlayedGame } = useStoreDelete("playedGame");

  const navigate = useNavigate();
  const sortedGames = useMemo(
    () => orderBy(playedGames?.sort(), ["date", "id"], ["desc", "desc"]),
    [playedGames]
  );

  const onAdd = () => navigate(paths.playedGameDialog.getUrl());
  const onEdit = (id: number) =>
    navigate(paths.playedGameDialog.getUrl({ id }));

  const actions: ContextMenuItem<number>[] = [
    {
      label: "Удалить",
      action: (id) => deletePlayedGame(id),
    },
  ];

  return (
    <Box height={"100%"} px={1} position={"relative"}>
      <PlayedGamesRouter />
      <List
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          left: 0,
          top: 0,
          px: 1,
          py: 0,
          overflowX: "hidden",
          overflowY: "scroll",
        }}
      >
        {sortedGames?.length === 0 && (
          <Typography variant="h6" color={"GrayText"} textAlign={"center"}>
            Список пуст
          </Typography>
        )}
        {sortedGames?.map((playedGame) => (
          <ContextMenu key={playedGame.id} id={playedGame.id} actions={actions}>
            <PlayedGameListItem onClick={onEdit} playedGame={playedGame} />
          </ContextMenu>
        ))}
      </List>
      <Fab
        onClick={onAdd}
        sx={{ bottom: 16, right: 16, position: "absolute" }}
        color="primary"
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

import { Box, Fab, List, Typography } from "@mui/material";
import { useStoreDelete, useStoreGetAll } from "@libs/Store";
import AddIcon from "@mui/icons-material/Add";
import { ContextMenu, ContextMenuItem } from "@libs/Common";
import { PlayedGameListItem } from "./PlayedGameListItem";
import { useMemo, useState } from "react";
import { orderBy } from "lodash";
import { PlayedGameDialog } from "./PlayedGameDialog";

export function PlayedGames() {
  const { data: playedGames } = useStoreGetAll("playedGame");
  const { mutateAsync: deletePlayedGame } = useStoreDelete("playedGame");

  const sortedGames = useMemo(
    () => orderBy(playedGames?.sort(), ["date"], ["desc"]),
    [playedGames]
  );
  const [modalState, setModalState] = useState<{ id?: string; show: boolean }>({
    show: false,
  });

  const onAdd = () => setModalState({ show: true });
  const onEdit = (id: string) => setModalState({ id, show: true });

  const actions: ContextMenuItem<string>[] = [
    {
      label: "Удалить",
      action: (id: string) => deletePlayedGame(id),
    },
  ];

  return (
    <Box height={"100%"} px={1} position={"relative"}>
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
      {modalState.show && (
        <PlayedGameDialog
          id={modalState.id}
          open={modalState.show}
          onClose={() => setModalState({ show: false })}
        />
      )}
    </Box>
  );
}

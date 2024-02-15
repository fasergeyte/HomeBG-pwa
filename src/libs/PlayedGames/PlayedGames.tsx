import { Box, Fab, Typography } from "@mui/material";
import { useStoreDelete, useStoreGetAll } from "@libs/Store";
import AddIcon from "@mui/icons-material/Add";
import { ContextMenu, ContextMenuItem } from "@libs/Common";
import { PlayedGameListItem } from "./PlayedGameListItem";
import { useState } from "react";
import { PlayedGameDialog } from "./PlayedGameDialog";

export function PlayedGames() {
  const { data: playedGames } = useStoreGetAll("playedGame");
  const { mutateAsync: deletePlayedGame } = useStoreDelete("playedGame");

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
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          left: 0,
          top: 0,
          overflow: "scroll",
        }}
      >
        {playedGames?.length === 0 && (
          <Typography variant="h6" color={"GrayText"} textAlign={"center"}>
            Список пуст
          </Typography>
        )}
        {playedGames?.map((playedGame) => (
          <ContextMenu key={playedGame.id} id={playedGame.id} actions={actions}>
            <PlayedGameListItem onClick={onEdit} playedGame={playedGame} />
          </ContextMenu>
        ))}
      </Box>
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

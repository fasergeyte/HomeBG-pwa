import {
  Box,
  Fab,
  List,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/material";
import { useStoreAdd, useStoreDelete, useStoreGetAll } from "@libs/Store";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { ContextMenu, ContextMenuItem } from "@libs/Common";

export function Games() {
  const { data: games } = useStoreGetAll("game");
  const { mutateAsync: addGame } = useStoreAdd("game");
  const { mutateAsync: deleteGame } = useStoreDelete("game");

  const [isAdding, setIsAdding] = useState<boolean>(false);

  const onSubmit = async (value: string) => {
    const trimmed = value.trim();

    if (trimmed) {
      await addGame({
        name: trimmed,
      });
    }

    setIsAdding(false);
  };

  const onAdd = () => setIsAdding(true);

  const actions: ContextMenuItem<number>[] = [
    {
      label: "Удалить",
      action: (id) => deleteGame(id),
    },
  ];

  return (
    <Box height={"100%"} px={1}>
      <List
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          left: 0,
          top: 0,
          px: 1,
          py: 0,
          overflowY: "scroll",
        }}
      >
        {games?.length === 0 && (
          <Typography variant="h6" color={"GrayText"} textAlign={"center"}>
            Список пуст
          </Typography>
        )}
        {games?.map((game) => (
          <ContextMenu key={game.id} id={game.id} actions={actions}>
            <ListItemButton
              sx={{ width: 1, p: 1, my: 1 / 2, bgcolor: "background.paper" }}
            >
              <Stack
                direction="row"
                sx={{
                  width: "calc(100%)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {game.name}
                </Typography>
              </Stack>
            </ListItemButton>
          </ContextMenu>
        ))}
        {isAdding && (
          <Stack key="new" direction={"row"} sx={{ mb: 1, p: 1, mx: 1 / 4 }}>
            <TextField
              autoFocus
              label="Имя"
              variant="outlined"
              sx={{ backgroundColor: "white" }}
              fullWidth
              onBlur={(e) => onSubmit(e.target.value)}
            />
          </Stack>
        )}
      </List>
      {!isAdding && (
        <Fab
          onClick={onAdd}
          sx={{ bottom: 16, right: 16, position: "absolute" }}
          color="primary"
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}

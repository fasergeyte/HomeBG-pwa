import {
  Box,
  Card,
  Fab,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/material";
import { useStoreAdd, useStoreDelete, useStoreGetAll } from "@libs/Store";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { ContextMenu, ContextMenuItem } from "@libs/Common";

export function Players() {
  const { data: players } = useStoreGetAll("player");
  const { mutateAsync: addPlayer } = useStoreAdd("player");
  const { mutateAsync: deletePlayer } = useStoreDelete("player");

  const [isAdding, setIsAdding] = useState<boolean>(false);

  const onSubmit = async (value: string) => {
    const trimmed = value.trim();

    if (trimmed) {
      await addPlayer({
        name: trimmed,
      });
    }

    setIsAdding(false);
  };

  const onAdd = () => setIsAdding(true);

  const actions: ContextMenuItem<string>[] = [
    {
      label: "Удалить",
      action: (id: string) => deletePlayer(id),
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
        {players?.length === 0 && (
          <Typography variant="h6" color={"GrayText"} textAlign={"center"}>
            Список пуст
          </Typography>
        )}
        {players?.map((player) => (
          <ContextMenu key={player.id} id={player.id} actions={actions}>
            <Card key={player.name} sx={{ width: 1, p: 1, my: 1 / 2 }}>
              <ListItemButton sx={{}}>
                <Stack direction="row">
                  <Typography variant="h6">{player.name}</Typography>
                </Stack>
              </ListItemButton>
            </Card>
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
      </Box>
      {!isAdding && (
        <Fab
          hidden={isAdding}
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

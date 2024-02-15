import { Box, Card, Fab, Stack, Typography } from "@mui/material";
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

  const actions: ContextMenuItem<string>[] = [
    {
      label: "Удалить",
      action: (id: string) => deleteGame(id),
    },
  ];

  return (
    <Box height={"100%"} px={1}>
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
        {games?.length === 0 && (
          <Typography variant="h6" color={"GrayText"} textAlign={"center"}>
            Список пуст
          </Typography>
        )}
        {games?.map((game) => (
          <ContextMenu key={game.id} id={game.id} actions={actions}>
            <Card key={"name:" + game.name} sx={{ mb: 1, p: 1, height: 56 }}>
              <Stack direction="row">
                <Typography variant="h6">{game.name}</Typography>
              </Stack>
            </Card>
          </ContextMenu>
        ))}
      </Box>
      {isAdding && (
        <Stack direction={"row"}>
          <TextField
            autoFocus
            label="Имя"
            variant="outlined"
            fullWidth
            onBlur={(e) => onSubmit(e.target.value)}
          />
        </Stack>
      )}
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

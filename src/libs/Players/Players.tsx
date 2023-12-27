import { Box, Card, Fab, Stack, Typography } from "@mui/material";
import { getDb, useStoreGetAll } from "@libs/Store";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import { useState } from "react";

export function Players() {
  const { data: players } = useStoreGetAll("player");
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const onSubmit = async (value: string) => {
    const trimmed = value.trim();

    if (trimmed) {
      await (
        await getDb()
      ).add("player", {
        name: trimmed,
      });
    }

    setIsAdding(false);
  };

  const onAdd = () => setIsAdding(true);

  return (
    <Box height={"100%"} px={1}>
      <Box>
        {players?.map((player) => (
          <Card key={"name:" + player.name} sx={{ mb: 1, p: 1, height: 56 }}>
            <Stack direction="row">
              <Typography variant="h6">{player.name}</Typography>
            </Stack>
          </Card>
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

import { Box, Card, Stack, Typography } from "@mui/material";
import { useStoreGetAll } from "@libs/Store";

export function Players() {
  const { data: players } = useStoreGetAll("player");

  return (
    <Box height={"100%"}>
      <Box>
        {players?.map((player) => (
          <Card key={player.name} sx={{ mb: 1 }}>
            <Stack direction="row">
              <Typography
                sx={{ width: "2em", textAlign: "center" }}
                variant="h6"
              >
                {player.mark}
              </Typography>
              <Typography variant="h6">{player.name}</Typography>
            </Stack>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

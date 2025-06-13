import { Box, Divider, Stack, Typography } from "@mui/material";

interface GameStatsRowProps {
  title: string;
  total: number;
  wins: number;
}

export function GameStatsRow(props: GameStatsRowProps) {
  const { title, total, wins } = props;
  return (
    <Box width={"fit-content"}>
      <Stack direction={"row"} gap={1} width={"fit-content"}>
        <Typography flex={1}>{title}</Typography>
        {total > 1 && <Typography>x{total}</Typography>}
        {wins < 6 ? (
          Array.from({ length: wins }).map((_, i) => (
            <Typography key={i}>🏆</Typography>
          ))
        ) : (
          <Typography>🏆x{wins}</Typography>
        )}
      </Stack>
      <Divider />
    </Box>
  );
}

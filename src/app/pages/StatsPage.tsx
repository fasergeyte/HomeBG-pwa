import { Header } from "@libs/Common";
import { Stats } from "@libs/Stats";
import { Stack } from "@mui/material";

export function StatsPage() {
  return (
    <Stack
      direction={"column"}
      sx={{ width: "100%", height: "100vh", bgcolor: "background.level0" }}
    >
      <Header title="Статистика" hasBack={true} />
      <Stats />
    </Stack>
  );
}

import { Header } from "@libs/Common";
import { Stats } from "@libs/Stats";
import Box from "@mui/material/Box";

export function StatsPage() {
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Header title="Статистика" hasBack={true} />
      <Stats />
    </Box>
  );
}

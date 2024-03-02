import { Header } from "@libs/Common";
import { Home } from "@libs/Home";
import { Stack } from "@mui/material";

export function HomePage() {
  return (
    <Stack
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <Header title="Настолки" />
      <Home />
    </Stack>
  );
}

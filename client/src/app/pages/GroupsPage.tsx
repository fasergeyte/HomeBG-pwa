import { Header } from "@libs/Common";
import { Groups } from "@libs/Groups";
import { Stack } from "@mui/material";

export function GroupsPage() {
  return (
    <Stack
      direction={"column"}
      sx={{ width: "100%", height: "100vh", bgcolor: "background.level0" }}
    >
      <Header title="Группы" hasBack={true} hasMenu={false} />
      <Groups />
    </Stack>
  );
}

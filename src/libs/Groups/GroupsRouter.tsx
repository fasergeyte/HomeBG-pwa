import { Route, Routes } from "react-router-dom";
import { paths } from "@libs/Routing";
import { GroupDialog } from "./GroupDialog";

export function GroupsRouter() {
  return (
    <Routes>
      <Route path={paths.groupDialog.route} Component={GroupDialog} />
    </Routes>
  );
}

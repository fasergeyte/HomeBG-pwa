import { Route, Routes } from "react-router";
import { PlayedGameDialog } from "./PlayedGameDialog";
import { paths } from "@libs/Routing";

export function PlayedGamesRouter() {
  return (
    <Routes>
      <Route path={paths.playedGameDialog.route} Component={PlayedGameDialog} />
    </Routes>
  );
}

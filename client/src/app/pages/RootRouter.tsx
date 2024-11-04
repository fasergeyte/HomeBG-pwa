import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import { HomePage } from "./HomePage";
import { paths } from "@libs/Routing";
import { StatsPage } from "./StatsPage";
import { GroupsPage } from "./GroupsPage";

export function RootRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path={paths.home.route} element={<HomePage />} />
        <Route path={paths.playerStats.route} element={<StatsPage />} />
        <Route path={paths.groups.route} element={<GroupsPage />} />
        <Route
          path="/"
          element={<Navigate to={paths.home.getUrl()} replace={true} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

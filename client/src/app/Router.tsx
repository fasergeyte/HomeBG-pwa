import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { paths } from "@libs/Routing";
import { StatsPage } from "./pages/StatsPage";
import { Auth } from "./Auth";

export function Router() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path={paths.home.route} element={<HomePage />} />
        <Route path={paths.playerStats.route} element={<StatsPage />} />
        <Route path={paths.auth.route} element={<Auth />} />
        <Route
          path="*"
          element={<Navigate to={paths.home.getUrl()} replace={true} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

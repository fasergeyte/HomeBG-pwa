import { Route, Routes, Navigate, MemoryRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { paths } from "@libs/Routing";
import { StatsPage } from "./pages/StatsPage";
import { Auth } from "./Auth";

export function Router() {
  const initialEntries = [
    typeof window !== "undefined"
      ? window.location.pathname
      : import.meta.env.BASE_URL || "/",
  ];

  return (
    <MemoryRouter
      basename={import.meta.env.BASE_URL}
      initialEntries={initialEntries}
    >
      <Routes>
        <Route path={paths.home.route} element={<HomePage />} />
        <Route path={paths.playerStats.route} element={<StatsPage />} />
        <Route path={paths.auth.route} element={<Auth />} />
        <Route
          path="*"
          element={<Navigate to={paths.home.getUrl()} replace={true} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

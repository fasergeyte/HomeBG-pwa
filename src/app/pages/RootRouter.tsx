import {
  Route,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { RootPage } from "./RootPage";
import { paths } from "@libs/Routing";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={paths.root.route} element={<RootPage />} />
  )
);

export function RootRouter() {
  return <RouterProvider router={router} />;
}

import {
  Route,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { RootPage } from "./RootPage";

const router = createBrowserRouter(
  createRoutesFromElements(<Route path="/" element={<RootPage />} />)
);

export function RootRouter() {
  return <RouterProvider router={router} />;
}

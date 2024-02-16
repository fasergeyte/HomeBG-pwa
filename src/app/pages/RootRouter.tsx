import {
  Route,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { RootPage } from "./RootPage";

console.log(process.env);
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={import.meta.env.BASE_URL} element={<RootPage />} />
  )
);

export function RootRouter() {
  return <RouterProvider router={router} />;
}

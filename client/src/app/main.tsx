import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Box } from "@mui/material";
import { ru } from "date-fns/locale";
import { setDefaultOptions } from "date-fns";

setDefaultOptions({ locale: ru });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Box
      sx={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <App />
    </Box>
  </React.StrictMode>
);

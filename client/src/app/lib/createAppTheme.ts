import { createTheme } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

declare module "@mui/material/styles" {
  interface TypeBackground {
    level0: string;
  }
}

export function createAppTheme() {
  return createTheme({
    palette: {
      background: {
        level0: grey[300],
      },
    },
    components: {
      MuiListItemButton: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: "#fff",
            },
          },
        },
      },
    },
  });
}

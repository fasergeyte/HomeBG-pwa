import { ThemeProvider } from "@mui/material/styles";
import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import { Router } from "./Router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";
import { createAppTheme } from "./lib/createAppTheme";
import { ApiProvider } from "./ApiContext";

const queryClient = new QueryClient();

const theme = createAppTheme();

function App() {
  return (
    <ApiProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router />
          </ThemeProvider>
        </QueryClientProvider>
      </LocalizationProvider>
    </ApiProvider>
  );
}

export default App;

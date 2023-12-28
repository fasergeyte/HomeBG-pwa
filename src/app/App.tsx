import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import { RootRouter } from "./pages/RootRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const theme = createTheme();
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RootRouter />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

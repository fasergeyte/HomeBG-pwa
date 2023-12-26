import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import { RootRouter } from "./pages/RootRouter";

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RootRouter />
    </ThemeProvider>
  );
}

export default App;

import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Stack,
} from "@mui/material";
import { Games } from "@libs/Games";
import { PlayedGames } from "@libs/PlayedGames";
import { Players } from "@libs/Players";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import CasinoIcon from "@mui/icons-material/Casino";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { HomeSection, UrlParams, paths } from "@libs/Routing";

export function Home() {
  const navigate = useNavigate();
  const { section } = useParams<UrlParams<"home">>();

  if (!section) return <Navigate to={paths.home.getUrl()} />;

  return (
    <Stack height={1}>
      <Box
        sx={{
          backgroundColor: "background.level0",
          pt: 1,
          height: "100%",
          position: "relative",
        }}
      >
        {HomeSection.Games === section && <Games />}
        {HomeSection.Players === section && <Players />}
        {HomeSection.PlayedGames === section && <PlayedGames />}
      </Box>
      <BottomNavigation
        showLabels
        value={section}
        onChange={(event, section) => {
          navigate(paths.home.getUrl({ section }));
        }}
      >
        <BottomNavigationAction
          value={HomeSection.Games}
          label="Игры"
          icon={<CasinoIcon />}
        />
        <BottomNavigationAction
          value={HomeSection.PlayedGames}
          label="Партии"
          icon={<Diversity3Icon />}
        />
        <BottomNavigationAction
          value={HomeSection.Players}
          label="Игроки"
          icon={<AccessibilityNewIcon />}
        />
      </BottomNavigation>
    </Stack>
  );
}

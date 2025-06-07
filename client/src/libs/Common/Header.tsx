import {
  AppBar,
  CircularProgress,
  Drawer,
  IconButton,
  MenuItem,
  MenuList,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { error } from ".";
import { AuthMenuItem } from "./AuthMenuItem";
import {
  addTestGames,
  addTestPlayers,
  generateTestPlayedGames,
} from "@libs/Dev";
import { IndexedDBBackup } from "@libs/Store";

interface HeaderProps {
  title: string;
  hasBack?: boolean;
  hasMenu?: boolean;
}

export function Header(props: HeaderProps) {
  const { title, hasBack, hasMenu = true } = props;
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestDataLoading, setIsTestDataLoading] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {hasBack && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="back"
              sx={{ mr: 2 }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {hasMenu && (
            <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          // Better open performance on mobile.
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
        }}
      >
        <MenuList sx={{ width: 175 }}>
          <AuthMenuItem />
          <MenuItem
            disabled={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              try {
                // TODO: sync
              } catch (e) {
                error("Sync error", e);
              }
              setIsSyncing(false);
            }}
          >
            Синхронизация
            {isSyncing && <CircularProgress sx={{ ml: 1 }} size={16} />}
          </MenuItem>
          <MenuItem
            onClick={async () => {
              IndexedDBBackup.createAndDownloadBackup();
            }}
          >
            Скачать бэкап файл
          </MenuItem>
          {import.meta.env.NODE_ENV !== "production" && [
            <MenuItem
              key="add-pgame"
              disabled={isSyncing}
              onClick={async () => {
                setIsTestDataLoading(true);
                try {
                  await generateTestPlayedGames({
                    fromDate: new Date(2019, 0, 1),
                    toDate: new Date(),
                    quantity: 1000,
                  });
                } catch (e) {
                  error("Sync error", e);
                }
                setIsTestDataLoading(false);
              }}
            >
              dev gen payedGames
              {isTestDataLoading && (
                <CircularProgress sx={{ ml: 1 }} size={16} />
              )}
            </MenuItem>,
            <MenuItem
              key="add-player"
              disabled={isTestDataLoading}
              onClick={async () => {
                setIsTestDataLoading(true);
                try {
                  await addTestPlayers();
                } catch (e) {
                  error("Sync error", e);
                }
                setIsTestDataLoading(false);
              }}
            >
              dev add players
              {isTestDataLoading && (
                <CircularProgress sx={{ ml: 1 }} size={16} />
              )}
            </MenuItem>,
            <MenuItem
              key="add-game"
              disabled={isTestDataLoading}
              onClick={async () => {
                setIsTestDataLoading(true);
                try {
                  await addTestGames();
                } catch (e) {
                  error("Sync error", e);
                }
                setIsTestDataLoading(false);
              }}
            >
              dev add games
              {isTestDataLoading && (
                <CircularProgress sx={{ ml: 1 }} size={16} />
              )}
            </MenuItem>,
          ]}
        </MenuList>
      </Drawer>
    </>
  );
}

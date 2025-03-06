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
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { error } from ".";
import { AuthMenuItem } from "./AuthMenuItem";

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
        </MenuList>
      </Drawer>
    </>
  );
}

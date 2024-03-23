import {
  AppBar,
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
import { GoogleSyncServiceInst } from "@libs/GoogleSync";

interface HeaderProps {
  title: string;
  hasBack?: boolean;
}

export function Header(props: HeaderProps) {
  const { title, hasBack } = props;
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
        }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              GoogleSyncServiceInst.createSheet();
            }}
          >
            Синхронизация
          </MenuItem>
        </MenuList>
      </Drawer>
    </>
  );
}

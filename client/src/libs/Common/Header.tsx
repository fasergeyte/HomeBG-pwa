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
import { useNavigate } from "react-router";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { error } from ".";
import { IndexedDBBackup } from "@libs/Store";
import { useQueryClient } from "@tanstack/react-query";

interface HeaderProps {
  title: string;
  hasBack?: boolean;
  hasMenu?: boolean;
}

export function Header(props: HeaderProps) {
  const { title, hasBack, hasMenu = true } = props;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
          <MenuItem
            onClick={async () => {
              IndexedDBBackup.createAndDownloadBackup();
            }}
          >
            Экспорт
          </MenuItem>

          <MenuItem
            onClick={async () => {
              try {
                await IndexedDBBackup.importBackupFromFile();
                // Инвалидируем React Query кэши чтобы перезагрузить данные
                queryClient.invalidateQueries();
              } catch (e) {
                error("Ошибка импорта", e);
              }
            }}
          >
            Импорт
          </MenuItem>
        </MenuList>
      </Drawer>
    </>
  );
}

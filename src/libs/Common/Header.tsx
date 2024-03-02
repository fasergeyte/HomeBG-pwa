import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  hasBack?: boolean;
}

export function Header(props: HeaderProps) {
  const { title, hasBack } = props;
  const navigate = useNavigate();
  return (
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
      </Toolbar>
    </AppBar>
  );
}

import { useAuth } from "@bisham/react-jwt-auth";
import { MenuItem } from "@mui/material";
import { useState } from "react";
import { SignInDialog } from "./SignIn/SignInDialog";
import { SignOutDialog } from "./SignIn/SignOutDialog";

export function AuthMenuItem() {
  const { isAuthenticated } = useAuth();
  const userName = localStorage.getItem("userName");
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  return (
    <>
      <MenuItem onClick={() => setIsSignInOpen(true)}>
        {isAuthenticated ? userName ?? "Выход" : "Вход"}
      </MenuItem>
      <SignInDialog
        isOpen={!isAuthenticated && isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
      <SignOutDialog
        isOpen={isAuthenticated && isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </>
  );
}

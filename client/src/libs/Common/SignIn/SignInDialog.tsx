import { Divider } from "@mui/material";
import googleIcon from "./googleSignInIcon.svg";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export function SignInDialog(props: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={props.isOpen} onClose={props.onClose}>
      <DialogTitle>Вход</DialogTitle>
      <Divider />
      <DialogContent>
        <Button
          href={`${import.meta.env.VITE_API_URL}/auth/google`}
          variant="outlined"
          startIcon={<img src={googleIcon} />}
        >
          Войти через Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}

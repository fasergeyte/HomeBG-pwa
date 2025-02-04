import { Divider } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useAuth } from "@bisham/react-jwt-auth";

export function SignOutDialog(props: { isOpen: boolean; onClose: () => void }) {
  const { signOut } = useAuth();
  return (
    <Dialog open={props.isOpen} onClose={props.onClose}>
      <DialogTitle>Выход</DialogTitle>
      <Divider />
      <DialogContent>
        <Button
          onClick={() => {
            signOut();
            props.onClose();
          }}
        >
          Выйти
        </Button>
      </DialogContent>
    </Dialog>
  );
}

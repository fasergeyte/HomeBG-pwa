import { MenuItem, Theme } from "@mui/material";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import { SystemStyleObject } from "@mui/system";
import { ReactNode, useState } from "react";

export type ContextMenuItem<T> = { label: string; action: (value: T) => void };

export interface ContextMenuProps<T> {
  children: ReactNode;
  sx?: SystemStyleObject<Theme>;
  id: T;
  actions: ContextMenuItem<T>[];
}

export function ContextMenu<T>(props: ContextMenuProps<T>) {
  const { children, sx, id, actions } = props;
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };

  const close = () => {
    setContextMenu(null);
  };

  return (
    <Box
      onContextMenu={handleContextMenu}
      sx={{ cursor: "context-menu", ...sx }}
    >
      {children}
      <Menu
        open={contextMenu !== null}
        onClose={close}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {actions.map(({ label, action }) => (
          <MenuItem
            onClick={() => {
              action(id);
              close();
            }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

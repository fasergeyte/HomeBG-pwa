import {
  Box,
  Fab,
  List,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/material";
import { useStoreDelete, useStoreGetAll } from "@libs/Store";
import AddIcon from "@mui/icons-material/Add";
import { ContextMenu, ContextMenuItem } from "@libs/Common";
import { paths } from "@libs/Routing";
import { useNavigate } from "react-router-dom";
import { GroupsRouter } from "./GroupsRouter";

export function Groups() {
  const navigate = useNavigate();

  const { data: groups } = useStoreGetAll("group");

  const { mutateAsync: deleteGroup } = useStoreDelete("group");

  const onOpenGroupDialog = (id?: number) =>
    navigate(paths.groupDialog.getUrl({ id }));

  const actions: ContextMenuItem<number>[] = [
    {
      label: "Удалить",
      action: (id) => deleteGroup(id),
    },
  ];

  return (
    <>
      <Box height={"100%"} px={1} position={"relative"}>
        <List
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            top: 0,
            px: 1,
            py: 0,
            overflowY: "scroll",
          }}
        >
          {groups?.length === 0 && (
            <Typography variant="h6" color={"GrayText"} textAlign={"center"}>
              Список пуст
            </Typography>
          )}
          {groups?.map((group) => (
            <ContextMenu key={group.id} id={group.id} actions={actions}>
              <ListItemButton
                onClick={() => onOpenGroupDialog(group.id)}
                sx={{ width: 1, p: 1, my: 1 / 2, bgcolor: "background.paper" }}
              >
                <Stack direction="row" sx={{ width: "calc(100%)" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {group.name}
                  </Typography>
                </Stack>
              </ListItemButton>
            </ContextMenu>
          ))}
        </List>
        <Fab
          onClick={() => onOpenGroupDialog()}
          sx={{ bottom: 16, right: 16, position: "absolute" }}
          color="primary"
        >
          <AddIcon />
        </Fab>
      </Box>
      <GroupsRouter />
    </>
  );
}

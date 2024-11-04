import {
  Player,
  Rule,
  useStoreAdd,
  useStoreGet,
  useStoreGetAllAsMap,
  useStorePut,
} from "@libs/Store";
import {
  Box,
  CircularProgress,
  Divider,
  Snackbar,
  TextField,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useForm, Controller, useWatch } from "react-hook-form";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UrlParams } from "@libs/Routing/paths";
import { FormValues } from "./types";
import { GroupPlayers } from "./GroupPlayers";
import { isNumber } from "lodash";
import { applyGroupRule } from "./lib/applyGroupRule";
import { error } from "@libs/Common";

const LINK_PATTERN = /^https:\/\/docs.google.com\/spreadsheets\/d\/(.*?)\/edit/;
const getLink = (docId: string) =>
  `https://docs.google.com/spreadsheets/d/${docId}/edit`;

const defaultValues: FormValues = {
  name: "",
  link: "",
  players: [],
  applyRule: false,
};

export function GroupDialog() {
  const params = useParams<UrlParams<"groupDialog">>();
  const id = params.id === undefined ? undefined : Number(params.id);
  const { data: editingGroup } = useStoreGet("group", id, !id);
  const { map: playersMap } = useStoreGetAllAsMap("player");

  const { mutateAsync: addGroup } = useStoreAdd("group");
  const { mutateAsync: putGroup } = useStorePut("group");

  const navigate = useNavigate();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues,
  });
  const formPlayers = useWatch({ control, name: "players" });

  React.useEffect(() => {
    if (!editingGroup) return;

    const groupPlayers = editingGroup.rules
      ?.find((r) => r.type === "players")
      ?.playerIds.map((id) => playersMap?.get(id))
      .filter((p): p is Player => !!p);

    reset({
      link: editingGroup.documentId ? getLink(editingGroup.documentId) : "",
      name: editingGroup.name,
      players: groupPlayers ?? [],
    });
  }, [editingGroup, playersMap, reset]);

  const [loadingLabel, setLoadingLabel] = React.useState<string>();

  const onSubmit = async (values: FormValues) => {
    try {
      setLoadingLabel("Сохранение");
      const documentId = values.link
        ? LINK_PATTERN.exec(values.link)?.[1]
        : undefined;

      const playersRule: Rule = {
        type: "players",
        playerIds: values.players.map((p) => p?.id).filter(isNumber),
      };
      let groupId;
      if (editingGroup) {
        const rules =
          editingGroup.rules?.filter((r) => r.type !== "players") ?? [];

        groupId = await putGroup({
          ...editingGroup,
          name: values.name,
          documentId,
          rules: rules.concat([playersRule]),
        });
      } else {
        groupId = await addGroup({
          name: values.name,
          documentId,
          rules: [playersRule],
        });
      }

      if (!values.applyRule) return;

      setLoadingLabel("Применение правил");

      await applyGroupRule(
        {
          type: "players",
          playerIds: formPlayers.map((player) => player?.id).filter(isNumber),
        },
        groupId
      );

      navigate(-1);
    } catch (e) {
      error(e)
    } finally {
      setLoadingLabel(undefined);
    }
  };

  return (
    <>
      <Dialog
        open={true}
        onClose={() => navigate(-1)}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit(onSubmit),
        }}
      >
        <DialogTitle>Группа</DialogTitle>
        <Divider />
        <DialogContent>
          <Controller
            name={"name"}
            control={control}
            rules={{
              required: { message: "обязательное поле", value: true },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                error={!!error}
                helperText={error?.message}
                label={"Название"}
                inputProps={field}
                type="text"
                sx={{ mb: 1 }}
              />
            )}
          />
          <Controller
            name={"link"}
            control={control}
            rules={{
              pattern: LINK_PATTERN,
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                error={!!error}
                helperText={error?.message}
                onFocus={(e) => e.target.select()}
                label={"Ссылка на таблицу"}
                inputProps={field}
                type="text"
              />
            )}
          />
          <Box mt={1}>
            <GroupPlayers control={control} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate(-1)}>Закрыть</Button>
          <Button disabled={!!loadingLabel} type="submit">
            {id ? "Сохранить" : "Добавить"}
            {!!loadingLabel && <CircularProgress sx={{ ml: 1 }} size={16} />}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!loadingLabel} message={loadingLabel} />
    </>
  );
}

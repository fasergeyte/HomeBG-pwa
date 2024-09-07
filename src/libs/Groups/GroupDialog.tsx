import { useStoreAdd, useStoreGet, useStorePut } from "@libs/Store";
import { Divider, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useForm, Controller } from "react-hook-form";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UrlParams } from "@libs/Routing/paths";

const LINK_PATTERN = /^https:\/\/docs.google.com\/spreadsheets\/d\/(.*?)\/edit/;
const getLink = (docId: string) =>
  `https://docs.google.com/spreadsheets/d/${docId}/edit`;

interface FormValues {
  name: string;
  link: string;
}
const defaultValues: FormValues = {
  name: "",
  link: "",
};

export function GroupDialog() {
  const params = useParams<UrlParams<"groupDialog">>();
  const id = params.id === undefined ? undefined : Number(params.id);
  const { data: editingGroup } = useStoreGet("group", id, !id);

  const { mutateAsync: addGroup } = useStoreAdd("group");
  const { mutateAsync: putGroup } = useStorePut("group");

  const navigate = useNavigate();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues,
  });

  React.useEffect(() => {
    if (!editingGroup) return;
    reset({
      link: editingGroup.documentId ? getLink(editingGroup.documentId) : "",
      name: editingGroup.name,
    });
  }, [editingGroup, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const documentId = values.link
        ? LINK_PATTERN.exec(values.link)?.[1]
        : undefined;

      if (editingGroup) {
        await putGroup({ ...editingGroup, name: values.name, documentId });
      } else {
        await addGroup({ name: values.name, documentId });
      }

      navigate(-1);
    } catch (e) {
      console.error(e);
    }
  };

  return (
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
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate(-1)}>Закрыть</Button>
        <Button type="submit">{id ? "Сохранить" : "Добавить"}</Button>
      </DialogActions>
    </Dialog>
  );
}

import { useStoreGetAll } from "@libs/Store";
import {
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useFieldArray, Control, useWatch } from "react-hook-form";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { Autocomplete } from "@libs/Common";
import { FormValues } from "./types";

export function GroupPlayers(props: {
  control: Control<FormValues>;
  groupId?: number;
}) {
  const { control } = props;

  const { data: players } = useStoreGetAll("player");

  const formPlayers = useWatch({ control, name: "players" });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "players",
  });

  const lastPlayer = formPlayers.at(-1);

  React.useEffect(() => {
    if (lastPlayer || formPlayers.length === 0) {
      append(null, { shouldFocus: false });
    }
  }, [append, formPlayers, lastPlayer]);

  return (
    <Card variant="outlined" sx={{ p: 1 }}>
      <Typography variant="body1" mb={1}>
        Автодобавление если все игроки ниже присутствуют.
      </Typography>
      <Box mb={1}>
        {fields.map((field, index) => (
          <Stack key={field.id} direction="row">
            <Controller
              name={`players.${index}`}
              control={control}
              render={({ field: { onChange, ...props } }) => (
                <Autocomplete
                  onChange={(e, val) => {
                    onChange(val);
                  }}
                  fullWidth={true}
                  freeSolo={true}
                  clearOnBlur={true}
                  autoSelect={true}
                  options={players ?? []}
                  loading={players === undefined}
                  getOptionLabel={(val) =>
                    typeof val === "string" ? val : val.name
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="игрок"
                      sx={{
                        "& .MuiInputBase-root": {
                          borderBottomRightRadius: 0,
                          borderTopRightRadius: 0,
                          borderBottomLeftRadius:
                            fields.length - 1 === index ? 4 : 0,
                          borderTopLeftRadius: 0 === index ? 4 : 0,
                        },
                      }}
                    />
                  )}
                  {...props}
                />
              )}
            />
            <IconButton onClick={() => remove(index)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
      </Box>
      <Controller
        name={`applyRule`}
        control={control}
        render={({ field: { onChange, value } }) => (
          <FormControlLabel
            label="Добавить к созданным"
            control={
              <Checkbox checked={!!value} onChange={onChange} {...props} />
            }
          />
        )}
      />
    </Card>
  );
}

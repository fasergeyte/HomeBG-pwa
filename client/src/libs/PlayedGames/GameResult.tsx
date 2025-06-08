import { useStoreGetAll } from "@libs/Store";
import { Skeleton, Stack, TextField, Typography } from "@mui/material";
import { Controller, useFieldArray, Control, useWatch } from "react-hook-form";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { Autocomplete } from "@libs/Common";
import { FormValues } from "./types";

export function GameResult(props: {
  control: Control<FormValues>;
  isLoading?: boolean;
}) {
  const { control, isLoading = false } = props;

  const { data: players } = useStoreGetAll("player");

  const result = useWatch({ control, name: "result" });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "result",
  });

  const lastPlayer = result.at(-1)?.player;

  React.useEffect(() => {
    if (
      (lastPlayer || result.length === 0) &&
      // проверяем что данные в форме и fields уже синхронизировались
      fields.length === result.length
    ) {
      append(
        { place: result.length + 1, player: null },
        { shouldFocus: false }
      );
    }
  }, [append, result, lastPlayer, fields.length]);

  if (isLoading) {
    return (
      <>
        <Typography variant="h6">
          <Skeleton variant="text" width={100} />
        </Typography>
        <Skeleton variant="rectangular" height={40 * 4} />
      </>
    );
  }
  return (
    <>
      <Typography variant="h6">Результат</Typography>
      {fields.map((field, index) => (
        <Stack key={field.id} direction="row">
          <Controller
            name={`result.${index}.place`}
            control={control}
            render={({ field }) => (
              <TextField
                size="small"
                inputProps={field}
                type="number"
                sx={{
                  width: "60px",
                  "& .MuiInputBase-root": {
                    borderBottomRightRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: fields.length - 1 === index ? 4 : 0,
                    borderTopLeftRadius: 0 === index ? 4 : 0,
                  },
                }}
              />
            )}
          />
          <Controller
            name={`result.${index}.player`}
            control={control}
            render={({ field: { onChange, ...props } }) => (
              <Autocomplete
                onChange={(_e, val) => {
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
                        borderBottomLeftRadius: 0,
                        borderTopLeftRadius: 0,
                        borderBottomRightRadius:
                          fields.length - 1 === index ? 4 : 0,
                        borderTopRightRadius: 0 === index ? 4 : 0,
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
    </>
  );
}

import {
  Game,
  PlayedGame,
  Player,
  useStoreAdd,
  useStoreGet,
  useStoreGetAll,
  useStorePut,
} from "@libs/Store";
import { Divider, Stack, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { DatePicker } from "@mui/x-date-pickers";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { UrlParams } from "@libs/Routing/paths";
import { v4 as uuid } from "uuid";
import { Autocomplete } from "@libs/Common";

interface FormValues {
  date: Date;
  game: Game | string | null;
  result: { place: number; player: Player | string | null }[];
}
const defaultValues: Partial<FormValues> = {
  date: new Date(),
  game: null,
  result: [{ place: 1, player: null }],
};

export function PlayedGameDialog() {
  const params = useParams<UrlParams<"playedGameDialog">>();
  const id = params.id === undefined ? undefined : params.id;
  const { data: editedGame } = useStoreGet("playedGame", id, !id);

  const { data: players } = useStoreGetAll("player");
  const { data: games } = useStoreGetAll("game");

  const { mutateAsync: addPlayer } = useStoreAdd("player");
  const { mutateAsync: addGame } = useStoreAdd("game");
  const { mutateAsync: addPlayedGame } = useStoreAdd("playedGame");
  const { mutateAsync: putPlayedGame } = useStorePut("playedGame");

  const navigate = useNavigate();

  const { control, watch, handleSubmit, reset } = useForm<FormValues>({
    defaultValues,
  });

  React.useEffect(() => {
    if (!editedGame) return;
    reset({
      date: editedGame.date,
      game: games?.find((g) => g.id === editedGame.gameId),
      result: editedGame.result.map((res) => ({
        place: res.place,
        player: players?.find((p) => p.id === res.playerId),
      })),
    });
  }, [editedGame, games, players, reset]);

  const result = watch("result");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "result",
  });

  const lastPlayer = result.at(-1)?.player;

  React.useEffect(() => {
    if (lastPlayer || result.length === 0) {
      append(
        { place: result.length + 1, player: null },
        { shouldFocus: false }
      );
    }
  }, [append, result, lastPlayer]);

  const onSubmit = async (values: FormValues) => {
    try {
      const result = values.result
        .filter((p) => p.player)
        .map(async (item) => {
          const player = item.player!;

          if (typeof player !== "string") {
            return {
              place: item.place,
              playerId: player.id,
            };
          }

          const existed = players?.find(
            (p) => p.name.toLowerCase() === player.toLowerCase()
          );

          if (existed) {
            return {
              place: item.place,
              playerId: existed.id,
            };
          }

          // Новый игрок если не выбран а введен самостоятельно
          const playerId = await addPlayer({ name: player.trim() });
          return {
            place: item.place,
            playerId,
          };
        });

      const game = values.game;
      if (!game) {
        throw new Error("Не указана игра.");
      }

      // Новый игрок если не выбран а введен самостоятельно
      const existedGame =
        typeof game !== "string"
          ? game
          : games?.find((g) => g.name.toLowerCase() === game.toLowerCase());

      const gameId: number =
        existedGame?.id ||
        (await addGame({
          // код выше гарантирует что сейчас это строка
          name: (game as string).trim(),
        }));

      const toSave: PlayedGame = {
        id: editedGame?.id ?? uuid(),
        date: values.date,
        gameId,
        result: await Promise.all(result),
        modifiedAt: new Date(),
      };

      if (!editedGame) {
        addPlayedGame(toSave);
      } else {
        putPlayedGame(toSave);
      }

      navigate("..", { replace: true });
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
      <DialogTitle>Игра</DialogTitle>
      <Divider />
      <DialogContent>
        <Controller
          name={"date"}
          control={control}
          render={({ field }) => (
            <DatePicker label={"дата"} sx={{ width: 1 }} {...field} />
          )}
        />
        <Controller
          name={"game"}
          control={control}
          render={({ field: { onChange, ...props } }) => (
            <Autocomplete
              fullWidth={true}
              sx={{ mt: 1 }}
              onChange={(e, val) => {
                onChange(val);
              }}
              freeSolo={true}
              clearOnBlur={true}
              autoSelect={true}
              options={games ?? []}
              loading={games === undefined}
              getOptionLabel={(val) =>
                typeof val === "string" ? val : val.name
              }
              renderInput={(params) => <TextField {...params} label="игра" />}
              {...props}
            />
          )}
        />
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
                      borderBottomLeftRadius:
                        fields.length - 1 === index ? 4 : 0,
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
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate(-1)}>Закрыть</Button>
        <Button type="submit">{id ? "Сохранить" : "Добавить"}</Button>
      </DialogActions>
    </Dialog>
  );
}

import {
  PlayedGame,
  useStoreAdd,
  useStoreGet,
  useStoreGetAll,
  useStorePut,
} from "@libs/Store";
import { Box, Divider, Skeleton, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { DatePicker } from "@mui/x-date-pickers";
import { useForm, Controller } from "react-hook-form";
import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { UrlParams } from "@libs/Routing/paths";
import { v4 as uuid } from "uuid";
import { Autocomplete } from "@libs/Common";
import { GameResult } from "./GameResult";
import { FormValues } from "./types";

const defaultValues: Partial<FormValues> = {
  date: new Date(),
  game: null,
  result: [{ place: 1, player: null }],
};

export function PlayedGameDialog() {
  const params = useParams<UrlParams<"playedGameDialog">>();
  const id = params.id === undefined ? undefined : params.id;
  const { data: editedGame, isLoading: editedGameIsLoading } = useStoreGet(
    "playedGame",
    id,
    !id
  );

  const { data: players, isLoading: playersIsLoading } =
    useStoreGetAll("player");
  const { data: games, isLoading: gamesIsLoading } = useStoreGetAll("game");

  const { mutateAsync: addPlayer } = useStoreAdd("player");
  const { mutateAsync: addGame } = useStoreAdd("game");
  const { mutateAsync: addPlayedGame } = useStoreAdd("playedGame");
  const { mutateAsync: putPlayedGame } = useStorePut("playedGame");

  const navigate = useNavigate();

  const { control, handleSubmit, reset } = useForm<FormValues>({
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

      const gameId: string =
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

      navigate(-1);
    } catch (e) {
      console.error(e);
    }
  };

  const isLoading = editedGameIsLoading || playersIsLoading || gamesIsLoading;

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
        {isLoading ? (
          <Skeleton variant="rectangular" height={56} width={246} />
        ) : (
          <Controller
            name={"date"}
            control={control}
            render={({ field }) => (
              <DatePicker label={"дата"} sx={{ width: 1 }} {...field} />
            )}
          />
        )}

        {isLoading ? (
          <Skeleton variant="rectangular" height={56} />
        ) : (
          <Controller
            name={"game"}
            control={control}
            render={({ field: { onChange, ...props } }) => (
              <Autocomplete
                fullWidth={true}
                sx={{ mt: 1 }}
                onChange={(_e, val) => {
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
        )}

        <Box mt={1}>
          <GameResult isLoading={isLoading} control={control} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate(-1)}>Закрыть</Button>
        <Button type="submit">{id ? "Сохранить" : "Добавить"}</Button>
      </DialogActions>
    </Dialog>
  );
}

import {
  Group,
  PlayedGame,
  useStoreAdd,
  useStoreGet,
  useStoreGetAll,
  useStorePut,
} from "@libs/Store";
import { Box, Divider, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { DatePicker } from "@mui/x-date-pickers";
import { useForm, Controller } from "react-hook-form";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UrlParams } from "@libs/Routing/paths";
import { v4 as uuid } from "uuid";
import { Autocomplete } from "@libs/Common";
import { GameResult } from "./GameResult";
import { FormValues } from "./types";
import { isNumber, isString } from "lodash";
import { getGroupsForGame } from "@libs/Groups";

const defaultValues: Partial<FormValues> = {
  date: new Date(),
  game: null,
  result: [{ place: 1, player: null }],
  groups: [],
};

export function PlayedGameDialog() {
  const params = useParams<UrlParams<"playedGameDialog">>();
  const id = params.id === undefined ? undefined : params.id;
  const { data: editedGame } = useStoreGet("playedGame", id, !id);

  const { data: players } = useStoreGetAll("player");
  const { data: games } = useStoreGetAll("game");
  const { data: groups } = useStoreGetAll("group");

  const { mutateAsync: addPlayer } = useStoreAdd("player");
  const { mutateAsync: addGame } = useStoreAdd("game");
  const { mutateAsync: addPlayedGame } = useStoreAdd("playedGame");
  const { mutateAsync: putPlayedGame } = useStorePut("playedGame");

  const navigate = useNavigate();

  const { control, watch, handleSubmit, reset, setValue, getFieldState } =
    useForm<FormValues>({
      defaultValues,
    });
  const result = watch("result");

  React.useEffect(() => {
    if (editedGame) return;
    const fs = getFieldState("groups");
    if (fs.isDirty) return;

    const groupsByRules = getGroupsForGame(groups, {
      playerIds: result
        .map((res) => !isString(res?.player) && res.player?.id)
        .filter(isNumber),
    });

    setValue("groups", groupsByRules ?? [], { shouldTouch: false });
    return;
  }, [editedGame, getFieldState, groups, result, setValue]);

  React.useEffect(() => {
    if (!editedGame) return;
    reset({
      date: editedGame.date,
      game: games?.find((g) => g.id === editedGame.gameId),
      result: editedGame.result.map((res) => ({
        place: res.place,
        player: players?.find((p) => p.id === res.playerId),
      })),
      groups:
        editedGame.groupsIds
          ?.map((gid) => groups?.find((g) => g.id === gid))
          .filter((g): g is Group => !!g) ?? [],
    });
  }, [editedGame, games, groups, players, reset]);

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
        groupsIds: values.groups.map((g) => g.id),
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
        <Box mt={1}>
          <GameResult control={control} />
        </Box>
        <Box mt={2}>
          <Controller
            name={"groups"}
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(e, val) => field.onChange(val)}
                sx={{ mt: 1 }}
                multiple={true}
                options={groups ?? []}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(opt, value) => opt.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" label="группы" />
                )}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate(-1)}>Закрыть</Button>
        <Button type="submit">{id ? "Сохранить" : "Добавить"}</Button>
      </DialogActions>
    </Dialog>
  );
}

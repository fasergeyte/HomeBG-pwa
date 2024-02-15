import { IDBPObjectStore } from "idb";
import { BgDbSchema, Game, Player, StoreName } from ".";

const players: Player[] = [
  {
    name: "Наташа",
  },
  {
    name: "Серега",
  },
  {
    name: "Влад",
  },
] as Player[];

const games: Game[] = [
  {
    name: "Колонизаторы",
  },
  {
    name: "Каркасон",
  },
  {
    name: "Колонизаторы2",
  },
  {
    name: "Каркасон2",
  },
  {
    name: "1Колонизаторы",
  },
  {
    name: "1Каркасон",
  },
  {
    name: "1Колонизаторы2",
  },
  {
    name: "1Каркасон2",
  },
  {
    name: "2Колонизаторы",
  },
  {
    name: "2Каркасон",
  },
  {
    name: "2Колонизаторы2",
  },
  {
    name: "2Каркасон2",
  },
  {
    name: "21Колонизаторы",
  },
  {
    name: "21Каркасон",
  },
  {
    name: "21Колонизаторы2",
  },
  {
    name: "21Каркасон2",
  },
] as Game[];

export function fillMockData(
  playerStore: IDBPObjectStore<
    BgDbSchema,
    ArrayLike<StoreName>,
    "player",
    "versionchange"
  >,
  gameStore: IDBPObjectStore<
    BgDbSchema,
    ArrayLike<StoreName>,
    "game",
    "versionchange"
  >
) {
  if (process.env.NODE_ENV === "production") return;
  players.forEach((player) => playerStore.add(player as Player));
  games.forEach((game) => gameStore.add(game as Game));
}

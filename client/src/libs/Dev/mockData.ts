import { clone, random, range } from "lodash";
import { Game, getDb, PlayedGame, Player } from "../Store";
import { v4 as uuid } from "uuid";

interface Options {
  fromDate: Date;
  toDate: Date;
  quantity: number;
  maxPlayers?: number;
  minPlayers?: number;
}

export async function generateTestPlayedGames(options: Options) {
  const { fromDate, toDate, quantity, minPlayers = 1 } = options;

  const db = await getDb();

  const players = await db.getAll("player");
  const games = await db.getAll("game");
  const maxPlayers = Math.min(
    options.maxPlayers ?? players.length,
    players.length
  );

  const newPlayedGames: PlayedGame[] = [];
  for (let i = 0; i < quantity; i++) {
    const playersSuite = clone(players);
    const playersCount = random(minPlayers, maxPlayers);
    const result = range(playersCount).map((i) => {
      const pIdx = random(playersSuite.length - 1);
      const res = { place: i + 1, playerId: playersSuite[pIdx].id };
      playersSuite.splice(pIdx, 1);
      return res;
    });
    newPlayedGames.push({
      id: "test-" + uuid(),
      date: new Date(random(fromDate.getTime(), toDate.getTime())),
      gameId: games[random(0, games.length - 1)].id,
      modifiedAt: new Date(),
      result,
    });
  }
  const promises = newPlayedGames.map(
    async (playedGame) => await db.add("playedGame", playedGame)
  );

  await Promise.all(promises);
}

const mockedPlayers: Player[] = [
  {
    name: "Наташа",
    id: "test-Наташа",
    modifiedAt: new Date(),
  },
  {
    name: "Серега",
    id: "test-Серега",
    modifiedAt: new Date(),
  },
{
    name: "Влад",
    id: "test-Влад",
    modifiedAt: new Date(),
  },
  {
    name: "Степан",
    id: "test-Степан",
    modifiedAt: new Date(),
  },
  {
    name: "Кира",
    id: "test-Кира",
    modifiedAt: new Date(),
  },
  {
    name: "Василий",
    id: "test-Василий",
    modifiedAt: new Date(),
  },
  {
    name: "Маша",
    id: "test-Маша",
    modifiedAt: new Date(),
  },
  {
    name: "Дима",
    id: "test-Дима",
    modifiedAt: new Date(),
  },
] as Player[];

export async function addTestPlayers() {
  const db = await getDb();

  const promises = mockedPlayers.map(
    async (item) => await db.add("player", item)
  );

  await Promise.all(promises);
}
export const mockedGames: Game[] = [
  {
    name: "Колонизаторы",
    id: "test-Колонизаторы",
    modifiedAt: new Date(),
  },
  {
    name: "Каркасон",
    id: "test-Каркасон",
    modifiedAt: new Date(),
  },
  {
    name: "Лоскутное Королевство",
    id: "test-Лоскутное Королевство",
    modifiedAt: new Date(),
  },
  {
    name: "Жадюги",
    id: "test-Жадюги",
    modifiedAt: new Date(),
  },
  {
    name: "Древний ужас",
    id: "test-Древний ужас",
    modifiedAt: new Date(),
  },
  {
    name: "Путь лепестка",
    id: "test-Путь лепестка",
    modifiedAt: new Date(),
  },
  {
    name: "Эпик",
    id: "test-Эпик",
    modifiedAt: new Date(),
  },
  {
    name: "Ред 7",
    id: "test-Ред 7",
    modifiedAt: new Date(),
  },
  {
    name: "Артишоки",
    id: "test-Артишоки",
    modifiedAt: new Date(),
  },
  {
    name: "Тобаго",
    id: "test-Тобаго",
    modifiedAt: new Date(),
  },
] as Game[];

export async function addTestGames() {
  const db = await getDb();

  const promises = mockedGames.map(async (item) => await db.add("game", item));

  await Promise.all(promises);
}

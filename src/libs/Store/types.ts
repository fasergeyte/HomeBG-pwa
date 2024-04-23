import * as idb from "idb";

export interface Player {
  name: string;
  id: number;
}

export interface Game {
  name: string;
  id: number;
}

export interface PlayedGame {
  id: string;
  date: Date;
  result: { place: number; playerId: number }[];
  gameId: number;
}

export interface BgDbSchema extends idb.DBSchema {
  player: {
    value: Player;
    key: number;
    indexes: { id: number; name: string };
  };
  game: {
    value: Game;
    key: number;
    indexes: { id: number; name: string };
  };
  playedGame: {
    value: PlayedGame;
    key: string;
    indexes: { id: string; date: string; gameId: number };
  };
}

// exclude id when we add
export type DataBase = Omit<idb.IDBPDatabase<BgDbSchema>, "add"> & {
  add<Name extends idb.StoreNames<BgDbSchema>>(
    store: Name,
    value: Omit<idb.StoreValue<BgDbSchema, Name>, "id">
  ): Promise<idb.StoreKey<BgDbSchema, Name>>;
};

export type StoreName = idb.StoreNames<BgDbSchema>;

export type StoreValue<Name extends StoreName> = idb.StoreValue<
  BgDbSchema,
  Name
>;

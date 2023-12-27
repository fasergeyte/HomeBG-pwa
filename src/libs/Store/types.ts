import * as idb from "idb";

export interface Player {
  name: string;
  id: string;
}

export interface Game {
  name: string;
  img?: string;
  id: string;
}

export interface BgDbSchema extends idb.DBSchema {
  player: {
    value: Player;
    key: string;
    indexes: { id: string; name: string };
  };
  game: {
    value: Game;
    key: string;
    indexes: { id: string; name: string };
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

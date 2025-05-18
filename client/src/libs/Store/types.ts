import type * as api from "bg-games-api";
import * as idb from "idb";
export interface Meta {
  id: string;
  syncDate?: Date;
}

export type Player = api.Player;
export type Game = api.Game;
export type PlayedGame = api.PlayedGame;

export interface BgDbSchema extends idb.DBSchema {
  player: {
    value: Player;
    key: string;
    indexes: { id: string; name: string; modifiedAt: Date };
  };
  game: {
    value: Game;
    key: string;
    indexes: { id: string; name: string; modifiedAt: Date };
  };
  playedGame: {
    value: PlayedGame;
    key: string;
    indexes: { id: string; date: Date; gameId: string; modifiedAt: Date };
  };
  meta: {
    value: Meta;
    key: string;
    indexes: { id: string };
  };
}

// exclude id when we add
export type DataBase = Omit<idb.IDBPDatabase<BgDbSchema>, "add"> & {
  add<Name extends idb.StoreNames<BgDbSchema>>(
    store: Name,
    value: Omit<idb.StoreValue<BgDbSchema, Name>, "id">
  ): Promise<idb.StoreKey<BgDbSchema, Name>>;

  getAllNewerThan<StoreName extends "player" | "game" | "playedGame">(
    this: DataBase,
    storeName: StoreName,
    date: Date
  ): Promise<BgDbSchema[StoreName]["value"][]>;
};

export type StoreName = idb.StoreNames<BgDbSchema>;

export type StoreValue<Name extends StoreName> = idb.StoreValue<
  BgDbSchema,
  Name
>;

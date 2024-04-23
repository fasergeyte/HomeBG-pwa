import { openDB } from "idb";
import { config } from "./config";
import { BgDbSchema, DataBase, Game, Player } from "./types";
import { games, players } from "./mockData";
import { v4 as uuid } from "uuid";
import { isNil } from "lodash";
import { error } from "@libs/Common";

let db: DataBase | null = null;

export async function getDb() {
  if (db) return db;
  const newVersion = config.dbVersion;
  let oldVersion: number | undefined = undefined;
  const original = await openDB<BgDbSchema>(config.dbName, config.dbVersion, {
    upgrade(db, oldVer) {
      oldVersion = oldVer;
      migrations.forEach((m) => {
        if (m.version <= oldVer || m.version > newVersion) return;
        m.structure?.(db);
      });
    },
  });
  original.onerror = (e) => {
    error("db error:", e);
  };
  // cast tapes because we excluded id when we use add function
  db = original as DataBase;
  if (!isNil(oldVersion)) {
    for (const m of migrations) {
      if (m.version <= oldVersion || m.version > newVersion) continue;

      await m.data(db);
    }
  }

  return db;
}

const migrations = [
  {
    version: 1,
    structure: (db: DataBase) => {
      const gameStore = db.createObjectStore("game", {
        keyPath: "id",
        autoIncrement: true,
      });
      gameStore.createIndex("name", "name", { unique: true });

      const playerStore = db.createObjectStore("player", {
        keyPath: "id",
        autoIncrement: true,
      });
      playerStore.createIndex("name", "name", { unique: true });

      const playedGame = db.createObjectStore("playedGame", {
        keyPath: "id",
        autoIncrement: false,
      });

      playedGame.createIndex("date", "date", { unique: false });
      playedGame.createIndex("gameId", "gameId", { unique: false });
    },
    data: async (db: DataBase) => {
      if (process.env.NODE_ENV === "production") return;
      const playerTxn = db.transaction("player", "readwrite");
      players.forEach((player) => playerTxn.store.add(player as Player));

      const gameTxn = db.transaction("game", "readwrite");
      games.forEach((game) => gameTxn.store.add(game as Game));
      await playerTxn.done;
      await gameTxn.done;
    },
  },
  {
    version: 2,
    data: async (db: DataBase) => {
      const oldData = await db.getAll("playedGame");
      const txn = db.transaction("playedGame", "readwrite");

      oldData.forEach((d) => {
        if (!txn.store) {
          throw new Error("Store 'playedGame' is not found");
        }

        txn.store.add({
          ...d,
          id: uuid(),
        });
        txn.store.delete(d.id);
      });

      await txn.done;
    },
  },
];

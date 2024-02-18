import { openDB } from "idb";
import { config } from "./config";
import { BgDbSchema, DataBase } from "./types";
import { fillMockData } from "./mockData";

let db: DataBase | null = null;

export async function getDb() {
  if (db) return db;

  const original = await openDB<BgDbSchema>(config.dbName, config.dbVersion, {
    upgrade(db, oldVersion) {
      switch (oldVersion) {
        case 0: {
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
            autoIncrement: true,
          });

          playedGame.createIndex("date", "date", { unique: false });
          playedGame.createIndex("gameId", "gameId", { unique: false });

          fillMockData(playerStore, gameStore);
        }
      }
    },
  });

  // cast tapes because we excluded id when we use add function
  db = original as DataBase;

  return db;
}
  
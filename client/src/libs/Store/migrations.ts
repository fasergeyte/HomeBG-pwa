import { error } from "@libs/Common";
import type { IDBPTransaction } from "idb";
import { v4 as uuid } from "uuid";
import type {
  DataBase,
  Player,
  Game,
  BgDbSchema,
  PlayedGame,
  StoreName,
} from "./types";
import * as dbV4 from "./types.v4";

export const migrations = [
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
  {
    /**
     * Добавляем
     * modifiedAt в партии
     */
    version: 3,
    data: async (db: DataBase) => {
      const oldData = await db.getAll("playedGame");
      const txn = db.transaction("playedGame", "readwrite");

      oldData.forEach((d) => {
        if (!txn.store) {
          throw new Error("Store 'playedGame' is not found");
        }

        txn.store.put({
          ...d,
          modifiedAt: d.date,
        });
      });

      await txn.done;
    },
  },
  {
    /**
     * Добавляем группы
     */
    version: 4,
    structure: (db: dbV4.DataBase) => {
      const group = db.createObjectStore("group", {
        keyPath: "id",
        autoIncrement: true,
      });

      group.createIndex("documentId", "documentId", { unique: true });
      group.createIndex("name", "name", { unique: true });
    },
  },
  {
    /**
     * Удаляем группы
     */
    version: 5,
    structure: (db: dbV4.DataBase) => {
      if (db.objectStoreNames.contains("group")) {
        db.deleteObjectStore("group");
      }
    },
    data: async (db: dbV4.DataBase) => {
      const oldGames = await db.getAll("game");
      const oldPlayers = await db.getAll("player");
      const oldPlayedGames = await db.getAll("playedGame");

      const gameTxn = db.transaction(
        "game",
        "readwrite"
      ) as unknown as IDBPTransaction<BgDbSchema, ["game"], "readwrite">;
      const playerTxn = db.transaction(
        "player",
        "readwrite"
      ) as unknown as IDBPTransaction<BgDbSchema, ["player"], "readwrite">;
      const playedGamesTxn = db.transaction(
        "playedGame",
        "readwrite"
      ) as unknown as IDBPTransaction<BgDbSchema, ["playedGame"], "readwrite">;

      try {
        const gameIdsMap = new Map<number, string>();

        oldGames.forEach((d) => {
          if (!gameTxn.store) {
            throw new Error("Store 'game' is not found");
          }

          const newItem: Game = {
            ...d,
            id: uuid(),
            modifiedAt: new Date(),
          };
          gameIdsMap.set(d.id, newItem.id);

          // удаляем запись старого типа
          gameTxn.store.delete(d.id as never);
          gameTxn.store.add(newItem);
        });

        const playerIdsMap = new Map<number, string>();

        oldPlayers.forEach((d) => {
          if (!playerTxn.store) {
            throw new Error("Store 'player' is not found");
          }

          const newItem: Player = {
            name: d.name,
            id: uuid(),
            modifiedAt: new Date(),
          };
          playerIdsMap.set(d.id, newItem.id);

          // удаляем запись старого типа
          playerTxn.store.delete(d.id as never);
          playerTxn.store.add(newItem);
        });

        oldPlayedGames.forEach((d) => {
          if (!playedGamesTxn.store) {
            throw new Error("Store 'playedGame' is not found");
          }
          const gameId = gameIdsMap.get(d.gameId);

          if (!gameId) {
            throw new Error(
              "new gameId is not found for:" + JSON.stringify(d, null, 0)
            );
          }

          const result = d.result.map((item, i) => {
            const playerId = playerIdsMap.get(item.playerId);

            if (!playerId) {
              throw new Error(
                `new playerId is not found for: idx ${i} \n` +
                  JSON.stringify(d, null, 0)
              );
            }

            return {
              ...item,
              playerId,
            };
          });

          const newItem: PlayedGame = {
            date: new Date(d.date),
            id: d.id,
            modifiedAt: new Date(d.modifiedAt),
            gameId,
            result,
          };

          playedGamesTxn.store.put(newItem);
        });

        await gameTxn.done;
        await playerTxn.done;
        await playedGamesTxn.done;
      } catch (e) {
        error(e);
        gameTxn.abort();
        playerTxn.abort();
        playedGamesTxn.abort();
        throw e;
      }
    },
  },
  {
    /**
     * Добавляем meta-store
     */
    version: 6,
    structure: (
      db: DataBase,
      _oldVer: number,
      _newVersion: number | null,
      transaction: IDBPTransaction<BgDbSchema, StoreName[], "versionchange">
    ) => {
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      const gameStore = transaction.objectStore("game");
      const playerStore = transaction.objectStore("player");
      const playedGameStore = transaction.objectStore("playedGame");
      [gameStore, playerStore, playedGameStore].forEach((store) => {
        if (!store.indexNames.contains("modifiedAt")) {
          store.createIndex?.("modifiedAt", "modifiedAt");
        }
      });
    },
  },
];

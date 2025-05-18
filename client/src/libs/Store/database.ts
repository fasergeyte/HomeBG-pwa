import { openDB } from "idb";
import { config } from "./config";
import { BgDbSchema, DataBase } from "./types";
import { isNil } from "lodash";
import { error } from "@libs/Common";
import { migrations } from "./migrations";

let db: DataBase | null = null;

export async function getDb() {
  if (db) return db;
  const _db = await createDatabase();
  db = _db;
  return db;
}

async function createDatabase() {
  const newVersion = config.dbVersion;
  let oldVersion: number | undefined = undefined;
  const original = await openDB<BgDbSchema>(config.dbName, config.dbVersion, {
    upgrade(db, oldVer, _newVersion, transaction) {
      oldVersion = oldVer;
      migrations.forEach((m) => {
        if (m.version <= oldVer || m.version > newVersion) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        m.structure?.(db as any, oldVer, newVersion, transaction);
      });
    },
  });
  original.onerror = (e) => {
    error("db error:", e);
  };

  // cast tapes because we excluded id when we use add function
  const db = original as DataBase;
  if (!isNil(oldVersion)) {
    for (const m of migrations) {
      if (m.version <= oldVersion || m.version > newVersion) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await m.data?.(db as any);
    }
  }

  Object.assign(db, { getAllNewerThan });
  return db;
}

async function getAllNewerThan<
  StoreName extends "player" | "game" | "playedGame"
>(this: DataBase, storeName: StoreName, date: Date) {
  const tx = this.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);

  const index = store.index("modifiedAt");

  // Используем диапазон для поиска дат, больших указанной
  const items = await index.getAll(IDBKeyRange.lowerBound(date, true));

  await tx.done;
  return items;
}

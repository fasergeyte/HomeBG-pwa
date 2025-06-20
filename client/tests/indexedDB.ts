import { indexedDB } from "fake-indexeddb";
import "fake-indexeddb/auto";

export function clearAllDatabases() {
  return new Promise<void>((resolve) => {
    const dbs = indexedDB.databases();
    dbs.then((databases) => {
      const deletions = databases.map((db) => {
        return new Promise<void>((res) => {
          const req = indexedDB.deleteDatabase(db.name!);
          req.onsuccess = () => res();
          req.onerror = () => res();
        });
      });
      Promise.all(deletions).then(() => resolve());
    });
  });
}

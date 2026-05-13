import { config } from "./config";
import { closeDb } from "./database";

/**
 * Утилиты для работы с импортом и экспортом
 */
export class importExport {
  /**
   * Создает бэкап всех данных из IndexedDB
   * @param dbName Имя базы данных
   * @returns Promise с объектом бэкапа
   */
  static async createBackup(
    dbName: string = config.dbName,
  ): Promise<IDBBackup> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      const backup: IDBBackup = {
        dbName,
        version: null,
        objectStores: {},
        createdAt: new Date().toISOString(),
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        backup.version = db.version;

        const transaction = db.transaction(db.objectStoreNames, "readonly");
        transaction.oncomplete = () => {
          db.close();
          resolve(backup);
        };
        transaction.onerror = (e) => {
          db.close();
          reject(
            new Error(`Transaction error: ${(e.target as IDBRequest).error}`),
          );
        };

        // Собираем данные из всех хранилищ
        Array.from(db.objectStoreNames).forEach((storeName) => {
          const store = transaction.objectStore(storeName);
          const storeData: IDBStoreBackup = {
            name: storeName,
            keyPath: store.keyPath,
            autoIncrement: store.autoIncrement,
            indexes: {},
            data: [],
          };

          // Собираем индексы
          Array.from(store.indexNames).forEach((indexName) => {
            const index = store.index(indexName);
            storeData.indexes[indexName] = {
              name: index.name,
              keyPath: index.keyPath,
              unique: index.unique,
              multiEntry: index.multiEntry,
            };
          });

          // Собираем данные
          const dataRequest = store.getAll();
          dataRequest.onsuccess = () => {
            storeData.data = dataRequest.result;
          };
          dataRequest.onerror = (e) => {
            console.error(
              `Error getting data from ${storeName}:`,
              (e.target as IDBRequest).error,
            );
          };

          backup.objectStores[storeName] = storeData;
        });
      };

      request.onerror = (event) => {
        reject(
          new Error(
            `Failed to open database: ${
              (event.target as IDBOpenDBRequest).error
            }`,
          ),
        );
      };
    });
  }

  /**
   * Сохраняет бэкап в файл
   * @param backup Объект бэкапа
   * @param fileName Имя файла (по умолчанию: `backup_${dbName}_${date}.json`)
   */
  static saveBackupToFile(backup: IDBBackup, fileName?: string): void {
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      fileName ||
      `backup_${backup.dbName}_${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Загружает бэкап из файла
   * @param file Файл с бэкапом
   * @returns Promise с объектом бэкапа
   */
  static loadBackupFromFile(file: File): Promise<IDBBackup> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const backup = JSON.parse(
            event.target?.result as string,
          ) as IDBBackup;
          resolve(backup);
        } catch (error) {
          reject(
            new Error(
              "Failed to parse backup file\n" + JSON.stringify(error, null, 2),
            ),
          );
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read backup file"));
      };
      reader.readAsText(file);
    });
  }

  /**
   * Восстанавливает данные из бэкапа в IndexedDB
   * @param backup Объект бэкапа
   * @returns Promise, который разрешается после завершения восстановления
   */
  static async restoreBackup(backup: IDBBackup): Promise<void> {
    // Закрываем существующее соединение перед восстановлением
    closeDb();

    // Даем браузеру время на закрытие соединений
    await new Promise((resolve) => setTimeout(resolve, 100));

    return new Promise((resolve, reject) => {
      // Сначала удаляем БД чтобы избежать конфликта версий
      const deleteRequest = indexedDB.deleteDatabase(backup.dbName);

      deleteRequest.onsuccess = () => {
        openNewDatabase();
      };

      deleteRequest.onerror = (event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        if (error?.name === "NotFoundError") {
          openNewDatabase();
        } else {
          reject(
            new Error(`Failed to delete database: ${error ?? "Unknown error"}`),
          );
        }
      };

      const openNewDatabase = () => {
        const openRequest = indexedDB.open(backup.dbName, config.dbVersion);

        openRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Создаем новые хранилища и индексы из бэкапа
          Object.values(backup.objectStores).forEach((storeBackup) => {
            const store = db.createObjectStore(storeBackup.name, {
              keyPath: storeBackup.keyPath,
              autoIncrement: storeBackup.autoIncrement,
            });

            Object.values(storeBackup.indexes).forEach((index) => {
              store.createIndex(index.name, index.keyPath, {
                unique: index.unique,
                multiEntry: index.multiEntry,
              });
            });
          });
        };

        openRequest.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const storeNames = Object.keys(backup.objectStores);

          if (storeNames.length === 0) {
            db.close();
            resolve();
            return;
          }

          const transaction = db.transaction(storeNames, "readwrite");

          transaction.oncomplete = () => {
            db.close();
            resolve();
          };

          transaction.onerror = (e) => {
            db.close();
            reject(
              new Error(`Transaction error: ${(e.target as IDBRequest).error}`),
            );
          };

          Object.values(backup.objectStores).forEach((storeBackup) => {
            const store = transaction.objectStore(storeBackup.name);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            storeBackup.data.forEach((item: any) => {
              const result = { ...item };
              for (const key in item) {
                result[key] = ["modifiedAt", "date"].includes(key)
                  ? new Date(item[key])
                  : item[key];
              }
              store.put(result);
            });
          });
        };

        openRequest.onerror = (event) => {
          reject(
            new Error(
              `Failed to open database: ${
                (event.target as IDBOpenDBRequest).error
              }`,
            ),
          );
        };
      };
    });
  }

  /**
   * Создает и скачивает бэкап (удобная комбинация createBackup + saveBackupToFile)
   * @param dbName Имя базы данных
   * @param fileName Опциональное имя файла
   */
  static async createAndDownloadBackup(
    dbName?: string,
    fileName?: string,
  ): Promise<void> {
    const backup = await this.createBackup(dbName);
    this.saveBackupToFile(backup, fileName);
  }

  static async importBackupFromFile(file?: File): Promise<void> {
    const fileToUse =
      file ??
      (await new Promise<File>((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json,application/*+json";
        input.onchange = () => {
          const f = input.files?.[0];
          if (f) resolve(f);
          else reject(new Error("No file selected"));
        };
        input.onerror = () => reject(new Error("File input error"));
        input.style.display = "none";
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      }));
    const backup = await this.loadBackupFromFile(fileToUse);
    await this.restoreBackup(backup);
  }
}

/**
 * Интерфейсы для типизации бэкапа
 */
interface IDBBackup {
  dbName: string;
  version: number | null;
  objectStores: Record<string, IDBStoreBackup>;
  createdAt: string;
}

interface IDBStoreBackup {
  name: string;
  keyPath: string | string[] | null;
  autoIncrement: boolean;
  indexes: Record<string, IDBIndexBackup>;
  data: unknown[];
}

interface IDBIndexBackup {
  name: string;
  keyPath: string | string[];
  unique: boolean;
  multiEntry: boolean;
}

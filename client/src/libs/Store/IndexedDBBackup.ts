import { config } from "./config";

/**
 * Утилиты для работы с бэкапами IndexedDB
 */
export class IndexedDBBackup {
  /**
   * Создает бэкап всех данных из IndexedDB
   * @param dbName Имя базы данных
   * @returns Promise с объектом бэкапа
   */
  static async createBackup(
    dbName: string = config.dbName
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
            new Error(`Transaction error: ${(e.target as IDBRequest).error}`)
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
              (e.target as IDBRequest).error
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
            }`
          )
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
            event.target?.result as string
          ) as IDBBackup;
          resolve(backup);
        } catch (error) {
          reject(
            new Error(
              "Failed to parse backup file\n" + JSON.stringify(error, null, 2)
            )
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
    return new Promise((resolve, reject) => {
      // Сначала удаляем существующую базу, если она есть
      const deleteRequest = indexedDB.deleteDatabase(backup.dbName);

      deleteRequest.onsuccess = () => {
        // Создаем новую базу с нужной версией
        const openRequest = indexedDB.open(backup.dbName, backup.version || 1);

        openRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Создаем хранилища и индексы
          Object.values(backup.objectStores).forEach((storeBackup) => {
            const store = db.createObjectStore(storeBackup.name, {
              keyPath: storeBackup.keyPath,
              autoIncrement: storeBackup.autoIncrement,
            });

            // Создаем индексы
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

          // Получаем массив имен хранилищ
          const storeNames = Object.keys(backup.objectStores);

          // Заполняем хранилища данными
          const transaction = db.transaction(storeNames, "readwrite");

          transaction.oncomplete = () => {
            db.close();
            resolve();
          };

          transaction.onerror = (e) => {
            db.close();
            reject(
              new Error(`Transaction error: ${(e.target as IDBRequest).error}`)
            );
          };

          Object.values(backup.objectStores).forEach((storeBackup) => {
            const store = transaction.objectStore(storeBackup.name);
            storeBackup.data.forEach((item) => {
              store.put(item);
            });
          });
        };

        openRequest.onerror = (event) => {
          reject(
            new Error(
              `Failed to open database: ${
                (event.target as IDBOpenDBRequest).error
              }`
            )
          );
        };
      };

      deleteRequest.onerror = (event) => {
        reject(
          new Error(
            `Failed to delete database: ${
              (event.target as IDBOpenDBRequest).error
            }`
          )
        );
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
    fileName?: string
  ): Promise<void> {
    const backup = await this.createBackup(dbName);
    this.saveBackupToFile(backup, fileName);
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

import { openDB } from "idb";
import { config } from "./config";
import { BgDbSchema, DataBase, Player } from "./types";

let db: DataBase | null = null;

export async function getDb() {
    if (db) return db

    const original = await openDB<BgDbSchema>(config.dbName, config.dbVersion, {
        upgrade(db, oldVersion) {
            switch (oldVersion) {
                case 0: {
                    const gameStore = db.createObjectStore('game', { keyPath: 'id', autoIncrement: true });
                    gameStore.createIndex('name', 'name', { unique: true });

                    const playerStore = db.createObjectStore('player', { keyPath: 'id', autoIncrement: true });
                    playerStore.createIndex('name', 'name', { unique: true });

                    playerStore.add({
                        mark: '😊',
                        name: 'Серега'
                    } as Player)

                    playerStore.add({
                        mark: '🤷‍♂️',
                        name: 'Наташа'
                    } as Player)

                    playerStore.add({
                        mark: '🐱‍👓',
                        name: 'Влад'
                    } as Player)
                }
            }
        }
    });

    // cast tapes because we excluded id when we use add function
    db = original as DataBase;

    return db;
}


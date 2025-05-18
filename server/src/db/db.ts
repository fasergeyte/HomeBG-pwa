import path from "path";
import { DATA_DIR } from "../env";
import { ensureDir } from "fs-extra";
import type { Game, PlayedGame, Player } from "bg-games-api";

export interface User {
  id: string;
  name: string;
  email?: string;
  googleId: string;
  jwtSecureCode: string;
  playerId?: string;
}

interface Data {
  user: Record<string, User | undefined>;
  player: Record<string, Player | undefined>;
  game: Record<string, Game | undefined>;
  playedGame: Record<string, PlayedGame | undefined>;
}

const defaultData = { user: {}, player: {}, game: {}, playedGame: {} };

ensureDir(DATA_DIR).catch((e) => {
  console.error("Cannot create dir at", DATA_DIR);
  process.exit(1);
});

const dbAsync = import("lowdb/node").then((m) =>
  m.JSONFilePreset<Data>(path.join(DATA_DIR, "db.json"), defaultData)
);

export async function createUser(user: Omit<User, "id">) {
  const db = await dbAsync;

  const newUser = { ...user, id: `g:${user.googleId}` };
  db.data.user[newUser.id] = newUser;

  try {
    await db.write();
    console.log("User created:", user.name);
  } catch (e) {
    console.log("db write error", e);
  }
  return newUser;
}

export async function findOne<Entry extends keyof Data>(
  entryType: Entry,
  constrains: Partial<NonNullable<Data[Entry][string]>>
) {
  const db = await dbAsync;
  if (constrains.id) {
    return db.data[entryType][constrains.id];
  }
  const keys = Object.keys(constrains);

  const item = Object.values(db.data[entryType]).find((entry) => {
    return keys.every(
      (key) => key in entry && (entry as any)[key] === (constrains as any)[key]
    );
  });

  return item;
}

type DbEntry<Entry extends keyof Data> = NonNullable<Data[Entry][string]>;

export async function update<Entry extends keyof Data>(
  entryType: Entry,
  updatedEntries: DbEntry<Entry>[]
) {
  const db = await dbAsync;
  updatedEntries.forEach((updatedEntry) => {
    db.data[entryType][updatedEntry.id] = {
      ...updatedEntry,
      modifiedAt: new Date(),
    };
  });
}

export async function findAllModifiedAfter<Entry extends keyof Data>(
  entryType: Entry,
  date: Date | number
) {
  const data = (await dbAsync).data[entryType];

  return Object.values(data).filter((i) => i.modifiedAt >= date);
}

import path from "path";
import { DATA_DIR } from "./env";
import { ensureDir } from "fs-extra";

export interface User {
  id: string;
  name: string;
  email?: string;
  googleId: string;
  jwtSecureCode: string;
}

interface Data {
  users: User[];
}

const defaultData = { users: [] };

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
  db.data.users.push(newUser);

  try {
    await db.write();
    console.log("User created:", user.name);
  } catch (e) {
    console.log("db write error", e);
  }
  return newUser;
}

export async function findOneUser(constrains: Partial<User>) {
  const db = await dbAsync;

  const keys = Object.keys(constrains) as (keyof User)[];

  const user = db.data.users.find((user) => {
    return keys.every((key) => key in user && user[key] === constrains[key]);
  });

  return user;
}

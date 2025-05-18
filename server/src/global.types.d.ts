import type { User as DbUser } from "./db/db";

declare global {
  namespace Express {
    interface User extends DbUser {}
  }
}

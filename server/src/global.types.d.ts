import type { User as DbUser } from "./db";

declare global {
  namespace Express {
    interface User extends DbUser {}
  }
}

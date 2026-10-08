import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getServerEnv } from "#/lib/env";

import * as schema from "./schema";

function createDb() {
  return drizzle({ client: neon(getServerEnv().DATABASE_URL), schema });
}

export type Db = ReturnType<typeof createDb>;

let db: Db | undefined;

export function getDb(): Db {
  db ??= createDb();
  return db;
}

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { DB_CONNECTION_STRING } from "$env/static/private";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessionTable, users } from "./schema";
import * as schema from "./schema";

const pool = new pg.Pool({
  connectionString: DB_CONNECTION_STRING
});

export const db = drizzle(pool, { schema });
export const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, users);

// import * as dotenv from "dotenv";
import postgres from "postgres";
import { DB_CONNECTION_STRING } from "$env/static/private";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions, users } from "./schema";
// dotenv.config();

// console.log(DB_CONNECTION_STRING);
const client = postgres(DB_CONNECTION_STRING);

export const db = drizzle(client, { schema });

export const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

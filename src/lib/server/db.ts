// import * as dotenv from "dotenv";
import postgres from "postgres";
import { DB_CONNECTION_STRING } from "$env/static/private";
import { drizzle } from "drizzle-orm/postgres-js";
import * as dbSchema from "./schema";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions, users } from "./schema";
import { buildSchema } from "drizzle-graphql";
// dotenv.config();

// console.log(DB_CONNECTION_STRING);
const client = postgres(DB_CONNECTION_STRING);

export const db = drizzle(client, { schema: dbSchema });

const { schema } = buildSchema(db);
export const graphQlSchema = schema;

export const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

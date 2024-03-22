import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

const { DB_MASTER_PASSWORD, DB_USER, DB_HOST, DB_NAME, DB_CONNECTION_STRING } =
  process.env;

export default {
  schema: "./src/lib/server/schema.ts",
  out: "./drizzle",
  driver: "pg", // postgresql
  dbCredentials: {
    // host: DB_HOST as string,
    // user: DB_USER,
    // password: DB_MASTER_PASSWORD,
    // database: DB_NAME as string,
    // connectionString: "the-garden.c9m0yiyim7u1.eu-north-1.rds.amazonaws.com",
    connectionString: DB_CONNECTION_STRING as string,
  },
} satisfies Config;

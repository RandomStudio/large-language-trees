import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

// console.log(process.env);
const { DB_CONNECTION_STRING } = process.env;
console.log("process.env", { DB_CONNECTION_STRING });
export default {
  schema: "./src/lib/server/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DB_CONNECTION_STRING as string,
  },
} satisfies Config;

import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

const { SECRET_ARN } = process.env;

export default {
  schema: "./src/lib/server/schema.ts",
  out: "./drizzle",
  driver: "pg", // postgresql
  dbCredentials: {
    // host: env.DB_HOST,
    // user: env.DB_USER,
    // password: env.DB_PASSWORD,
    // database: env.DB_NAME,
    connectionString: SECRET_ARN as string,
  },
} satisfies Config;

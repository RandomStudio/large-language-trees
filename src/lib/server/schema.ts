import {
  integer,
  json,
  pgTable,
  serial,
  text,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
// import { drizzle } from "drizzle-orm/node-postgres";

export const plantsTable = pgTable("users", {
  id: serial("id").primaryKey(),
  commonName: text("common_name"),
  parent1: integer("parent1_id").references((): AnyPgColumn => plantsTable.id),
  parent2: integer("parent2_id").references((): AnyPgColumn => plantsTable.id),
  description: text("description"),
  properties: json("properties"), // TODO: could be separate table, later
  imageUrl: text("image_url"),
});

import { relations } from "drizzle-orm";
import {
  integer,
  json,
  pgTable,
  serial,
  text,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
// import { drizzle } from "drizzle-orm/node-postgres";

export const plantsTable = pgTable("plants", {
  id: serial("id").primaryKey(),
  commonName: text("common_name"),
  description: text("description"),
  properties: json("properties"), // TODO: could be separate table, later
  imageUrl: text("image_url"),
  parent1: integer("parent1_id"),
  parent2: integer("parent2_id"),
});

export const parentOne = relations(plantsTable, ({ many }) => ({
  children: many(plantsTable, {
    fields: [plantsTable.parent1],
    references: [plantsTable.id],
  }),
}));

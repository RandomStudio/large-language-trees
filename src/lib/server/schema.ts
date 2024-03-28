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

export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  commonName: text("common_name"),
  description: text("description"),
  properties: json("properties"), // TODO: could be separate table, later
  imageUrl: text("image_url"),
});

export const plantsRelations = relations(plants, ({ many }) => ({
  parents: many(plants),
}));

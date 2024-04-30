import { relations } from "drizzle-orm";
import { integer, json, pgTable, serial, text } from "drizzle-orm/pg-core";

export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  commonName: text("common_name"),
  description: text("description"),
  properties: json("properties"), // TODO: could be separate table, later
  imageUrl: text("image_url"),
  parent1: integer("parent1_id"),
  parent2: integer("parent2_id"),
  row: integer("positionRow"),
  col: integer("positionCol"),
});

export const plantRelations = relations(plants, ({ one }) => ({
  myParent1: one(plants, {
    fields: [plants.parent1],
    references: [plants.id],
  }),
  myParent2: one(plants, {
    fields: [plants.parent2],
    references: [plants.id],
  }),
}));

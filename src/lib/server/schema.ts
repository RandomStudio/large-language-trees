import { relations } from "drizzle-orm";
import { integer, json, pgTable, serial, text } from "drizzle-orm/pg-core";

export const plantsTable = pgTable("plants", {
  id: serial("id").primaryKey(),
  commonName: text("common_name"),
  description: text("description"),
  properties: json("properties"), // TODO: could be separate table, later
  imageUrl: text("image_url"),
});

export const parentageTable = pgTable("parentage", {
  childId: integer("child_id"),
  parent1Id: integer("parent_1_id"),
  parent2Id: integer("parent_2_id"),
});

export const plantsRelations = relations(plantsTable, ({ many }) => ({
  relations: many(parentageTable),
}));

export const childRelations = relations(parentageTable, ({ one }) => ({
  parent1: one(plantsTable, {
    fields: [parentageTable.parent1Id],
    references: [plantsTable.id],
    relationName: "relations_parent1",
  }),
  parent2: one(plantsTable, {
    fields: [parentageTable.parent2Id],
    references: [plantsTable.id],
    relationName: "relations_parent2",
  }),
  child: one(plantsTable, {
    fields: [parentageTable.childId],
    references: [plantsTable.id],
    relationName: "relations_child",
  }),
}));

import { relations, type InferSelectModel } from "drizzle-orm";
import {
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const plants = pgTable("plants", {
  id: text("id").primaryKey(),
  commonName: text("common_name"),
  description: text("description"),
  properties: json("properties"), // TODO: could be separate table, later
  imageUrl: text("image_url"),
  parent1: text("parent1_id"),
  parent2: text("parent2_id"),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  myGarden: one(gardens, {
    fields: [users.id],
    references: [gardens.userId],
  }),
}));

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const gardens = pgTable("gardens", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  name: text("name"),
});

export const gardensToPlants = pgTable(
  "gardens_to_plants",
  {
    gardenId: text("garden_id")
      .notNull()
      .references(() => gardens.id),
    plantId: text("plant_id")
      .notNull()
      .references(() => plants.id),
    rowIndex: integer("rowIndex").notNull(),
    colIndex: integer("colIndex").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gardenId, t.plantId] }),
  })
);

export const gardensToPlantsRelations = relations(
  gardensToPlants,
  ({ one }) => ({
    garden: one(gardens, {
      fields: [gardensToPlants.gardenId],
      references: [gardens.id],
    }),
    plant: one(plants, {
      fields: [gardensToPlants.plantId],
      references: [plants.id],
    }),
  })
);

export const gardensRelations = relations(gardens, ({ many }) => ({
  plantsInGarden: many(gardensToPlants),
}));

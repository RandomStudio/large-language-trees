import {
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const plantTable = pgTable("plant", {
  id: serial("id").primaryKey(),
  commonName: text("common_name"),
  description: text("description"),
  properties: json("properties"), // TODO: could be separate table, later
  imageUrl: text("image_url"),
  parent1: integer("parent1_id"),
  parent2: integer("parent2_id"),
  rowIndex: integer("rowIndex"),
  colIndex: integer("colIndex"),
});

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

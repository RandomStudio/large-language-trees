import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const plants = pgTable("plants", {
  id: text("id").primaryKey(),
  commonName: text("common_name").notNull(),
  description: text("description").notNull(),
  properties: json("properties").notNull(),
  imageUrl: text("image_url"),
  parent1: text("parent1"),
  parent2: text("parent2"),
  authorTop: text("author_top"),
  authorBottom: text("author_bottom")
});

export const plantsRelations = relations(plants, ({ many, one }) => ({
  inGardens: many(gardensToPlants),
  authorTopUser: one(users, {
    fields: [plants.authorTop],
    references: [users.id]
  }),
  authorBottomUser: one(users, {
    fields: [plants.authorBottom],
    references: [users.id]
  }),
  parentPlantTop: one(plants, {
    fields: [plants.parent1],
    references: [plants.id]
  }),
  parentPlantBottom: one(plants, {
    fields: [plants.parent2],
    references: [plants.id]
  })
}));

export const generatedPlants = pgTable("generated_plants", {
  plantId: text("plant_id").notNull().primaryKey(),
  givenName: text("given_name").notNull(),
  authorTop: text("author_top").notNull(),
  authorBottom: text("author_bottom").notNull(),
  parentTop: text("plant_top").notNull(),
  parentBottom: text("plant_bottom").notNull(),
  contents: json("contents"), // can be null, if plant not generated yet!
  originalImageUrl: text("orig_img_url"), // can be null, if image not generated yet!
  processedImageUrl: text("proc_img_url"), // can be null, if image not processed yet!
  errorMessage: text("error_message"), // will be null unless there is an error
  awaitingConfirmation: boolean("awaiting_confirmation").default(false)
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").default(false)
});

export type User = typeof users.$inferSelect;

export const generatedPlantsRelations = relations(
  generatedPlants,
  ({ one }) => ({
    authorTopUser: one(users, {
      fields: [generatedPlants.authorTop],
      references: [users.id]
    }),
    authorBottomUser: one(users, {
      fields: [generatedPlants.authorBottom],
      references: [users.id]
    }),
    parentPlantTop: one(plants, {
      fields: [generatedPlants.parentTop],
      references: [plants.id]
    }),
    parentPlantBottom: one(plants, {
      fields: [generatedPlants.parentBottom],
      references: [plants.id]
    })
  })
);

export const usersRelations = relations(users, ({ one }) => ({
  myGarden: one(gardens, {
    fields: [users.id],
    references: [gardens.userId]
  })
}));

export const sessionTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date"
  }).notNull()
});

export const gardens = pgTable("gardens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name")
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
    plantingDate: timestamp("planting_date").defaultNow().notNull()
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gardenId, t.plantId] })
  })
);

export const gardensToPlantsRelations = relations(
  gardensToPlants,
  ({ one }) => ({
    garden: one(gardens, {
      fields: [gardensToPlants.gardenId],
      references: [gardens.id]
    }),
    plant: one(plants, {
      fields: [gardensToPlants.plantId],
      references: [plants.id]
    })
  })
);

export const gardensRelations = relations(gardens, ({ many, one }) => ({
  plants: many(gardensToPlants),
  myOwner: one(users, {
    fields: [gardens.userId],
    references: [users.id]
  })
}));

export const promptSettingsTable = pgTable("prompt_settings", {
  id: text("id").primaryKey(),
  textModel: text("text_model").notNull(),
  textTemplate: text("text_template").notNull(),
  imageModel: text("image_model").notNull(),
  imageTemplate: text("image_template").notNull()
});

export const presentationState = pgTable("presentation_state", {
  id: text("screen_id").primaryKey(),
  priority: integer("priority_level"),
  contents: json("contents")
});

/**
 * We need to keep a persistent copy of incoming (Simple)Events so that
 * the serverless system can read and write these without having to be
 * permanently subscribed to the "events"
 */
export const eventLogs = pgTable("event_logs", {
  id: text("id").primaryKey(),
  contents: text("contents").notNull(),
  timestamp: timestamp("added", { withTimezone: true }).notNull().defaultNow()
});

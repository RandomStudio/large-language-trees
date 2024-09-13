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
  inSeedbanks: many(seedbanksToPlants),
  authorTop: one(users, {
    fields: [plants.authorTop],
    references: [users.id]
  }),
  authorBottom: one(users, {
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
  authorTop: text("author_top"),
  authorBottom: text("author_bottom"),
  parentPlantTop: text("plant_top"),
  parentPlantBottom: text("plant_bottom"),
  contents: json("contents"), // can be null, if plant not generated yet!
  imageUrl: text("image_url"), // can be null, if image not generated yet!
  errorMessage: text("error_message")
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").default(false)
});

export const generatedPlantsRelations = relations(
  generatedPlants,
  ({ one }) => ({
    authorTop: one(users, {
      fields: [generatedPlants.authorTop],
      references: [users.id]
    }),
    authorBottom: one(users, {
      fields: [generatedPlants.authorBottom],
      references: [users.id]
    }),
    parentPlantTop: one(plants, {
      fields: [generatedPlants.parentPlantTop],
      references: [plants.id]
    }),
    parentPlantBottom: one(plants, {
      fields: [generatedPlants.parentPlantBottom],
      references: [plants.id]
    })
  })
);

export const usersRelations = relations(users, ({ one }) => ({
  myGarden: one(gardens, {
    fields: [users.id],
    references: [gardens.userId]
  }),
  mySeedbank: one(seedbanks, {
    fields: [users.id],
    references: [seedbanks.userId]
  })
}));

export const sessions = pgTable("sessions", {
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
  plantsInGarden: many(gardensToPlants),
  myOwner: one(users, {
    fields: [gardens.userId],
    references: [users.id]
  })
}));

export const seedbanks = pgTable("seedbanks", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id)
});

export const seedbanksToPlants = pgTable(
  "seedbanks_to_plants",
  {
    seedbankId: text("seedbank_id")
      .notNull()
      .references(() => seedbanks.id),
    plantId: text("plant_id")
      .notNull()
      .references(() => plants.id)
  },
  (t) => ({
    pk: primaryKey({ columns: [t.seedbankId, t.plantId] })
  })
);

export const seedbanksToPlantsRelations = relations(
  seedbanksToPlants,
  ({ one }) => ({
    seedbank: one(seedbanks, {
      fields: [seedbanksToPlants.seedbankId],
      references: [seedbanks.id]
    }),
    plant: one(plants, {
      fields: [seedbanksToPlants.plantId],
      references: [plants.id]
    })
  })
);
export const seedbanksRelations = relations(seedbanks, ({ many }) => ({
  plantsInSeedbank: many(seedbanksToPlants)
}));

export const promptSettingsTable = pgTable("prompt_settings", {
  id: text("id").primaryKey(),
  textModel: text("text_model").notNull(),
  textPreamble: text("text_preamble").notNull(),
  textExplanation: text("text_explanation").notNull(),
  textInstructions: text("text_instructions").notNull(),
  imageModel: text("image_model").notNull(),
  imageInstructions: text("image_instructions").notNull()
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
  contents: json("contents").notNull(),
  timestamp: timestamp("added", { withTimezone: true }).notNull().defaultNow()
});

import type {
  gardens,
  gardensToPlants,
  plants,
  users,
} from "$lib/server/schema";

export type SelectPlant = typeof plants.$inferSelect;
export type InsertPlant = typeof plants.$inferInsert;

export type SelectUser = typeof users.$inferSelect;
export type SelectGarden = typeof gardens.$inferSelect;
export type GardenPlantEntry = typeof gardensToPlants.$inferInsert;

export type Characteristics = { [key: string]: string | number };

export interface PromptSection {
  label: string;
  description: string;
  text: string;
}

export interface PromptConfig {
  preamble: PromptSection;
  explanation: PromptSection;
  instructions: PromptSection;
}

export interface GardenPlantEntryWithPlant extends GardenPlantEntry {
  plant: SelectPlant;
}

export interface MyGarden extends SelectGarden {
  plantsInGarden: GardenPlantEntryWithPlant[];
}
export interface UserWithGarden extends SelectUser {
  myGarden: MyGarden;
}

import type {
  gardens,
  gardensToPlants,
  plants,
  seedbanks,
  seedbanksToPlants,
  users,
} from "$lib/server/schema";

export type SelectPlant = typeof plants.$inferSelect;
export type InsertPlant = typeof plants.$inferInsert;

export type SelectUser = typeof users.$inferSelect;

export type SelectGarden = typeof gardens.$inferSelect;
export type GardenPlantEntry = typeof gardensToPlants.$inferInsert;

export type SelectSeedbank = typeof seedbanks.$inferInsert;
export type SeedbankEntry = typeof seedbanksToPlants.$inferInsert;

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

export interface SeedbankEntryWithPlant extends SeedbankEntry {
  plant: SelectPlant;
}

export interface MySeeds extends SelectSeedbank {
  plantsInSeedbank: SeedbankEntryWithPlant[];
}

export interface UserWithSeedbank extends SelectUser {
  mySeeds: MySeeds;
}

export interface GardenViewData {
  seedBank: MySeeds;
  user: SelectUser;
  garden: MyGarden;
}

export interface PlantProperties {
  [key: string]: number | string;
}
export interface GeneratedImageResult {
  url: string;
}

export interface ImageUploadResult {
  url: string;
}

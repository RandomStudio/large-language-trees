import type {
  gardens,
  gardensToPlants,
  generatedImages,
  plants,
  presentationState,
  promptSettingsTable,
  seedbanks,
  seedbanksToPlants,
  users
} from "$lib/server/schema";

export type SelectPlant = typeof plants.$inferSelect;
export type InsertPlant = typeof plants.$inferInsert;

export type SelectUser = typeof users.$inferSelect;

export type SelectGarden = typeof gardens.$inferSelect;
export type GardenPlantEntry = typeof gardensToPlants.$inferInsert;

export type SelectSeedbank = typeof seedbanks.$inferInsert;
export type SeedbankEntry = typeof seedbanksToPlants.$inferInsert;

export type Characteristics = { [key: string]: string | number };

export type GeneratedImage = typeof generatedImages.$inferSelect;

export type SelectPromptSettings = typeof promptSettingsTable.$inferInsert;

export type PresentationDisplayState = typeof presentationState.$inferInsert;

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
  pleaseWait: boolean;
  url: string | null;
}

export interface ImageUploadResult {
  url: string;
}

export interface AttachImageRequest {
  plantId: string;
  url: string;
}

export interface AttachImageResponse {
  plantId: string;
  url: string;
}

export interface EnhancedGardenViewData extends GardenViewData {
  plantId: string; // Ajoutez d'autres champs si nécessaire
}

export interface PromptSection {
  label: string;
  description: string;
  text: string;
}

export type TextModelNames = "gpt-3.5-turbo" | "gpt-4-turbo";
export type ImageModelNames = "dall-e-3" | "dall-e-2";
export interface PromptConfig {
  text: {
    model: TextModelNames;
    preamble: PromptSection;
    explanation: PromptSection;
    instructions: PromptSection;
  };
  image: {
    model: ImageModelNames;
    instructions: string;
  };
}

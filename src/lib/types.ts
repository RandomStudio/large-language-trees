import type {
  gardens,
  gardensToPlants,
  generatedPlants,
  plants,
  presentationState,
  promptSettingsTable,
  seedbanks,
  seedbanksToPlants,
  users
} from "$lib/server/schema";
import type { DateTime } from "luxon";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export type SelectPlant = typeof plants.$inferSelect;
export type InsertPlant = typeof plants.$inferInsert;

/** WARNING: this type includes password hashes! */
export type SelectUser = typeof users.$inferSelect;

/** Use this when you need safe (public) access to basic user details */
export interface PublicUserInfo {
  id: string;
  username: string;
}

export type CandidatePlant = typeof generatedPlants.$inferSelect;

export type SelectGarden = typeof gardens.$inferSelect;
export type GardenPlantEntry = typeof gardensToPlants.$inferInsert;

export type SelectSeedbank = typeof seedbanks.$inferInsert;
export type SeedbankEntry = typeof seedbanksToPlants.$inferInsert;

export type Characteristics = { [key: string]: string | number };

export type GeneratedImage = typeof generatedPlants.$inferSelect;

export type SelectPromptSettings = typeof promptSettingsTable.$inferInsert;

export type PresentationDisplayState = typeof presentationState.$inferInsert;

export interface PlantWithDate extends SelectPlant {
  pollinationDate: Date;
}
export interface GardenWithPlants extends SelectGarden {
  plantsInGarden: PlantWithDate[];
}
export interface UserWithGarden extends SelectUser {
  myGarden: GardenWithPlants;
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

export interface PlantProperties {
  [key: string]: number | string;
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

export interface PollinationData {
  thisPlant: SelectPlant;
  otherPlant?: SelectPlant;
  thisUser: PublicUserInfo;
  otherUser?: PublicUserInfo;
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

export interface GeneratePlantRequestBody {
  thisUserId: string;
  thisPlantId: string;
  otherUserId: string;
  otherPlantId: string;
  /** Only used for developer prompt testing */
  prompt?: ChatCompletionMessageParam[];
  /** Only used for developer prompt testing */
  model?: string;
}

export interface ScanStartData {
  thisUser: PublicUserInfo;
  userPlants: SelectPlant[];
  thisPlant: SelectPlant;
}

export interface GenerateImageRequest {
  plantId: string;
  description: string;
  instructions?: string;
  model?: string;
  backgroundSecret?: string;
}

/** Should be identical to the version in
 * `netlify/functions/img-gen-background.mts`
 */
export interface BackroundGenerateImageRequest {
  plantId: string;
  fullPrompt: string;
  model: string;
  backgroundSecret: string;
}

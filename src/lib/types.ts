import type { plantTable } from "$lib/server/schema";

export type SelectPlant = typeof plantTable.$inferSelect;
export type InsertPlant = typeof plantTable.$inferInsert;

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

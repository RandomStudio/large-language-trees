import type { plants } from "$lib/server/schema";

export type SelectPlant = typeof plants.$inferSelect;
export type InsertPlant = typeof plants.$inferInsert;

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

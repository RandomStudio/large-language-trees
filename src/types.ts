import { plants } from "$lib/server/schema";
export type Plant = typeof plants.$inferSelect;

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

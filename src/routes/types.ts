export interface Plant {
  id: number;
  parent1?: number;
  parent2?: number;
  properties: Characteristics;
  commonName: string;
  description?: string;
  imageUrl?: string;
}

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

export interface Plant {
  id: string;
  parents?: string[];
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

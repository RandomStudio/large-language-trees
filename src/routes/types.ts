export interface Plant {
  id: string;
  parents?: [string, string];
  characteristics: Characteristics;
  commonName: string;
  description: string;
}

export type Characteristics = { [key: string]: string };

export interface PromptSection {
  label: string;
  description: string;
}

export interface PromptConfig {
  preamble: PromptSection;
  explanation: PromptSection;
  instructions: PromptSection;
}

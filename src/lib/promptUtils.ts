import type OpenAI from "openai";

import type {
  ImageModelNames,
  PromptConfig,
  SelectPlant,
  SelectPromptSettings,
  TextModelNames
} from "./types";

export const buildTextPrompt = (
  config: PromptConfig,
  plant1: SelectPlant,
  plant2: SelectPlant,
  userPickedNewName: string
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  const { template } = config.text;
  return [
    {
      role: "user",
      content: template
        .replaceAll("{PARENT1_COMMON_NAME}", plant1.commonName)
        .replaceAll("{PARENT2_COMMON_NAME", plant2.commonName)
        .replaceAll("{PARENT1_DESCRIPTION}", plant1.description)
        .replaceAll("{PARENT2_DESCRIPTION", plant2.description)
        .replaceAll("{NEW_PLANT_NAME}", userPickedNewName)
    }
  ];
};

export const buildImagePrompt = (
  instructions: string,
  description: string
): string => instructions + "\n\n" + description;

/** Given the settings for prompts as loaded from the DB, return
 *  a full PromptConfig object, substituting defaults only where
 *  necessary.
 */
export const promptRowToConfig = (
  rowFromTable: SelectPromptSettings
): PromptConfig => {
  return {
    text: {
      model: rowFromTable.textModel as TextModelNames,
      template: rowFromTable.textTemplate
    },
    image: {
      model: rowFromTable.imageModel as ImageModelNames,
      instructions: rowFromTable.imageInstructions
    }
  };
};

/** The opposite of `promptRowToConfig`: given a complete
 *  PromptConfig object, return an entry as per the DB row
 *  for these settings, minus the ID
 */
export const promptConfigToRow = (
  config: PromptConfig
): Partial<SelectPromptSettings> => {
  return {
    textModel: config.text.model,
    textTemplate: config.text.template,
    imageModel: config.image.model,
    imageInstructions: config.image.instructions
  };
};

export const capitalise = (s: string): string =>
  Array.from(s)
    .map((char, index) => (index === 0 ? char.toUpperCase() : char))
    .join("");

import type OpenAI from "openai";

import DefaultPrompt from "../defaults/prompt-config";
import type {
  Characteristics,
  ImageModelNames,
  PromptConfig,
  SelectPlant,
  SelectPromptSettings,
  TextModelNames
} from "./types";

export const buildTextPrompt = (
  config: PromptConfig,
  plant1: SelectPlant,
  plant2: SelectPlant
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  const { preamble, explanation, instructions } = config.text;
  return [
    {
      role: "system",
      content: preamble.text
    },
    {
      role: "user",
      content: explanation.text
    },
    {
      role: "user",
      content:
        "First plant JSON:\n" +
        "```json\n" +
        JSON.stringify(
          {
            commonName: plant1.commonName,
            description: plant1.description,
            properties: filterCharacteristicsForPrompt(
              plant1.properties as Characteristics
            )
          },
          null,
          2
        ) +
        "\n```" +
        "\n\n" +
        "Second plant JSON:\n" +
        "```json\n" +
        JSON.stringify(
          {
            commonName: plant2.commonName,
            description: plant2.description,
            properties: filterCharacteristicsForPrompt(
              plant2.properties as Characteristics
            )
          },
          null,
          2
        ) +
        "\n```" +
        "\n\n" +
        instructions.text
    }
  ];
};

/*** For now, removes any characteristics whose key contains "RGB", since these */
const filterCharacteristicsForPrompt = (
  originals: Characteristics
): Characteristics => {
  let o: Characteristics = {};
  Object.keys(originals).forEach((k) => {
    if (!k.includes("RGB")) {
      o[k] = originals[k];
    }
  });
  return o;
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
  const defaults = DefaultPrompt;
  return {
    text: {
      model: rowFromTable.textModel as TextModelNames,
      preamble: {
        label: defaults.text.preamble.label,
        description: defaults.text.preamble.description,
        text: rowFromTable.textPreamble
      },
      explanation: {
        label: defaults.text.explanation.label,
        description: defaults.text.explanation.description,
        text: rowFromTable.textExplanation
      },
      instructions: {
        label: defaults.text.instructions.label,
        description: defaults.text.instructions.description,
        text: rowFromTable.textInstructions
      }
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
    textPreamble: config.text.preamble.text,
    textExplanation: config.text.preamble.text,
    textInstructions: config.text.instructions.text,
    imageModel: config.image.model,
    imageInstructions: config.image.instructions
  };
};

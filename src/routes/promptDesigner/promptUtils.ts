import type OpenAI from "openai";
import type { PromptConfig, SelectPlant } from "../../types";

export const buildPrompt = (
  config: PromptConfig,
  plant1: SelectPlant,
  plant2: SelectPlant,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  const { preamble, explanation, instructions } = config;
  return [
    {
      role: "system",
      content: preamble.text,
    },
    {
      role: "user",
      content: explanation.text,
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
            properties: {
              ...(plant1.properties as object),
            },
          },
          null,
          2,
        ) +
        "\n```" +
        "\n\n" +
        "Second plant JSON:\n" +
        "```json\n" +
        JSON.stringify(
          {
            commonName: plant2.commonName,
            description: plant2.description,
            properties: {
              ...(plant1.properties as object),
            },
          },
          null,
          2,
        ) +
        "\n```" +
        "\n\n" +
        instructions.text,
    },
  ];
};

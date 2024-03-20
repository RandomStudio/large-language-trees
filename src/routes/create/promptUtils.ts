import type OpenAI from "openai";
import type { Plant, PromptConfig } from "../types";

export const buildPrompt = (
  config: PromptConfig,
  plant1: Plant,
  plant2: Plant,
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
        JSON.stringify(
          {
            commonName: plant1.commonName,
            description: plant1.description,
            properties: {
              ...plant1.properties,
            },
          },
          null,
          2,
        ) +
        "\n\n" +
        "Second plant JSON:\n" +
        JSON.stringify(
          {
            commonName: plant2.commonName,
            description: plant2.description,
            properties: {
              ...plant1.properties,
            },
          },
          null,
          2,
        ) +
        "\n\n" +
        instructions.text,
    },
  ];
};

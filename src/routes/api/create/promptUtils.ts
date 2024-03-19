import type OpenAI from "openai";
import type { Plant, PromptConfig } from "../../types";

export const buildPrompt = (
  config: PromptConfig,
  plant1: Plant,
  plant2: Plant,
): OpenAI.Chat.Completions.ChatCompletionMessageParam => {
  const { preamble, explanation, instructions } = config;
  return {
    role: "user",
    content:
      preamble.text +
      "\n\n" +
      explanation.text +
      "\n\n" +
      "First plant JSON:\n" +
      JSON.stringify(
        {
          commonName: plant1.commonName,
          description: plant1.description,
          properties: {
            ...plant1.characteristics,
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
            ...plant1.characteristics,
          },
        },
        null,
        2,
      ) +
      "\n\n" +
      instructions.text,
  };
};

export const parseNewPlant = (
  text: string,
  parents: [string, string],
): Plant | null => {
  const json = JSON.parse(text);
  if (json["commonName"] && json["description"] && json["properties"]) {
    console.log("JSON appears to have the valid fields");
    return {
      id: crypto.randomUUID(),
      parents,
      commonName: json["commonName"],
      description: json["description"],
      characteristics: { ...json["properties"] },
    };
  } else {
    throw Error("Fields missing from: " + JSON.stringify(Object.keys(json)));
  }
};

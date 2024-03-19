import { json, type RequestHandler } from "@sveltejs/kit";
import type { Plant, PromptConfig } from "../../types";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "$env/static/private";

import config from "./prompt-config.json";
import { buildPrompt, parseNewPlant } from "./promptUtils";

export const POST: RequestHandler = async ({ request }) => {
  const [plant1, plant2] = (await request.json()) as [Plant, Plant];

  console.log("got request", plant1.commonName, "x", plant2.commonName);

  const prompt = buildPrompt(config as PromptConfig, plant1, plant2);

  console.log("Using prompt: ******** \n", prompt);

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    messages: [prompt],
    model: "gpt-3.5-turbo",
  });

  console.log("response:", completion.choices);

  let offspring: Plant | null = null;

  for (const res of completion.choices) {
    console.log(JSON.stringify(res));
    const formattedContent = res.message.content || "{}";

    offspring = parseNewPlant(formattedContent, [plant1.id, plant2.id]);
    if (offspring) {
      console.log("Offspring:", offspring);
    } else {
      throw Error("Oops, couldn't parse the offspring text");
    }
  }

  return json(offspring);
};

import { json, type RequestHandler } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { getPromptSettings } from "$lib/server/promptSettings";
import { buildTextPrompt } from "$lib/promptUtils";
import { BACKGROUND_FN_SECRET } from "$env/static/private";
import type { GeneratePlantRequestBody } from "$lib/types";

/** Should be identical to the version in
 * `/netlify/functions/text-gen-background.mts`
 */
interface BackgroundGenerateTextRequest {
  userId: string;
  newPlantId: string;
  parent1Id: string;
  parent2Id: string;
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  backgroundSecret: string;
}

export const POST: RequestHandler = async ({ request, fetch }) => {
  const data = (await request.json()) as GeneratePlantRequestBody;

  const { prompt, parents, userId } = data;
  const [plant1, plant2] = parents;
  const promptSettings = await getPromptSettings();

  const messages = prompt || buildTextPrompt(promptSettings, plant1, plant2);
  const model = data.model || promptSettings.text.model;

  const newPlantId = uuidv4();

  const bodyJson: BackgroundGenerateTextRequest = {
    userId,
    newPlantId,
    parent1Id: plant1.id,
    parent2Id: plant2.id,
    model,
    messages: messages as {
      role: string;
      content: string;
    }[],
    backgroundSecret: BACKGROUND_FN_SECRET
  };

  console.log("sending body", bodyJson);

  const res = await fetch("/.netlify/functions/text-gen-background", {
    method: "POST",
    body: JSON.stringify(bodyJson)
  });

  return json({ newPlantId }, { status: res.status });
};

import { json, type RequestHandler } from "@sveltejs/kit";
import type { InsertPlant } from "$lib/types";
import { v4 as uuidv4 } from "uuid";
import { getPromptSettings } from "$lib/server/promptSettings";
import { buildTextPrompt } from "$lib/promptUtils";
import type { GeneratePlantRequestBody } from "./types";
import { BACKGROUND_FN_SECRET } from "$env/static/private";

/** Should be identical to the version in
 * `/netlify/functions/text-gen-background.mts`
 */
interface BackgroundGenerateTextRequest {
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  backgroundSecret: string;
}

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as GeneratePlantRequestBody;

  const { prompt, parents } = data;
  const [plant1, plant2] = parents;
  const promptSettings = await getPromptSettings();

  // TODO: pass full prompt (and settings?) to background function.
  // Return pleaseWait? Should client side poll "generated_text" table,
  // as with "generated_images"?

  const messages = prompt || buildTextPrompt(promptSettings, plant1, plant2);
  const model = data.model || promptSettings.text.model;

  const bodyJson: BackgroundGenerateTextRequest = {
    model,
    messages: messages as {
      role: string;
      content: string;
    }[],
    backgroundSecret: BACKGROUND_FN_SECRET
  };

  const res = await fetch("/.netlify/functions/img-gen-background", {
    method: "POST",
    body: JSON.stringify(bodyJson)
  });

  return json(await res.json(), { status: res.status });
};

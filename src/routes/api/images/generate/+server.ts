import { PLACEHOLDER_IMAGES, BACKGROUND_FN_SECRET } from "$env/static/private";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { GeneratedImageResult, PromptConfig } from "$lib/types";
import { buildImagePrompt } from "$lib/promptUtils";
import { getPromptSettings } from "$lib/server/promptSettings";
import type { GenerateImageRequest } from "./types";

/** Should be identical to the version in
 * `netlify/functions/img-gen-background.mts`
 */
interface BackroundGenerateImageRequest {
  plantId: string;
  fullPrompt: string;
  model: string;
  backgroundSecret: string;
}

export const POST: RequestHandler = async (event) => {
  const { request, fetch } = event;
  console.log({ PLACEHOLDER_IMAGES });
  const jsonBody = (await request.json()) as GenerateImageRequest;
  const { description, plantId, model, instructions } = jsonBody;

  if (PLACEHOLDER_IMAGES === "true") {
    const jsonResponse: GeneratedImageResult = {
      pleaseWait: false,
      url: "/plants/placeholder.png"
    };
    return json(jsonResponse, { status: 200 });
  }

  const promptSettings: PromptConfig = await getPromptSettings();

  const prompt = buildImagePrompt(
    instructions || promptSettings.image.instructions,
    description
  );

  console.log(
    `Will initiate (background) request for image generation with prompt "${prompt}" ...`
  );
  const bodyJson: BackroundGenerateImageRequest = {
    fullPrompt: prompt,
    backgroundSecret: BACKGROUND_FN_SECRET,
    plantId,
    model: model || promptSettings.image.model
  };
  console.log({ bodyJson });
  await fetch("/.netlify/functions/img-gen-background", {
    method: "POST",
    body: JSON.stringify(bodyJson)
  });

  const jsonResponse: GeneratedImageResult = { pleaseWait: true, url: null };
  return json(jsonResponse, { status: 200 });
};

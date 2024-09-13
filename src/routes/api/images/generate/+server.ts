import { json, type RequestHandler } from "@sveltejs/kit";
import type { GenerateImageRequest, PromptConfig } from "$lib/types";
import { buildImagePrompt } from "$lib/promptUtils";
import { getPromptSettings } from "$lib/server/promptSettings";

interface GenImageToServer {
  plantId: string;
  description: string;
}

/** Should be identical to the version in
 * `neflify/functions/complete-gen-background.mts`
 *
 * This is what our server needs to send back to the background function
 */
interface GenImageToBackground {
  plantId: string;
  fullPrompt: string;
  model: string;
}

// interface

/*
  This endpoint is used by the BACKGROUND function to get the full prompt
  needed for image generation.
*/
export const POST: RequestHandler = async ({ request, fetch }) => {
  const { plantId, description } = (await request.json()) as GenImageToServer;

  const bodyJson = await backgroundImageRequestBody(plantId, description);

  return json(bodyJson, { status: 200 });
};

const backgroundImageRequestBody = async (
  plantId: string,
  description: string,
  instructions?: string,
  model?: string
) => {
  const promptSettings: PromptConfig = await getPromptSettings();

  const prompt = buildImagePrompt(
    instructions || promptSettings.image.instructions,
    description
  );

  console.log(
    `Generating body for (background) request for image generation with prompt "${prompt}" ...`
  );
  const bodyJson: GenImageToBackground = {
    fullPrompt: prompt,
    plantId,
    model: model || promptSettings.image.model
  };

  return bodyJson;

  // Status 202 - "Accepted" - nothing created yet
};

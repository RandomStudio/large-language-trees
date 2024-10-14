import { error, json, type RequestHandler } from "@sveltejs/kit";
import type { PromptConfig } from "$lib/types";
import { buildImagePrompt } from "$lib/promptUtils";
import { getPromptSettings } from "$lib/server/promptSettings";
import { db } from "$lib/server/db";
import { generatedPlants } from "$lib/server/schema";
import { eq } from "drizzle-orm";

/**
 * Should be identical to version in `neftlify/functions/image-gen-background.mts`
 */
export interface GenImageToServer {
  plantId: string;
  description: string;
}

/** Should be identical to the version in
 * `neflify/functions/complete-gen-background.mts`
 *
 * This is what our server needs to send back to the background function
 */
export interface GenImageToBackground {
  plantId: string;
  fullPrompt: string;
  model: string;
}

/*
  This endpoint is used by the BACKGROUND function to get the full prompt
  needed for image generation.
*/
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { plantId, description } = (await request.json()) as GenImageToServer;

    const candidate = await db.query.generatedPlants.findFirst({
      where: eq(generatedPlants.plantId, plantId)
    });

    if (!candidate) {
      return error(404, "No matching candidate plant available");
    }

    const { givenName } = candidate;

    const bodyJson = await backgroundImageRequestBody(
      plantId,
      description,
      givenName
    );

    return json(bodyJson, { status: 200 });
  } catch (e) {
    console.error(
      "There was an error getting prompt details for Background Function:",
      e
    );
    console.warn("We will update an error message into the candidate entry...");

    const { plantId } = (await request.json()) as GenImageToServer;

    const updated = await db
      .update(generatedPlants)
      .set({
        errorMessage: "Error generating image prompt"
      })
      .where(eq(generatedPlants.plantId, plantId))
      .returning();

    return json({ updated }, { status: 500, statusText: JSON.stringify(e) });
  }
};

const backgroundImageRequestBody = async (
  plantId: string,
  description: string,
  givenName: string,
  model?: string
) => {
  const promptSettings: PromptConfig = await getPromptSettings();

  const prompt = buildImagePrompt(
    promptSettings.image.template,
    givenName,
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

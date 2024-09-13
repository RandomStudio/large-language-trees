import { json, type RequestHandler } from "@sveltejs/kit";
import type { GenImageToBackground } from "../generate/+server";

export interface GenImageTestToServer {
  plantId: string;
  fullPrompt: string;
  model: string;
}

/*
  This endpoint is used by the PROMPT UTIL / ADMIN to initiate
  image generation from the background
*/
export const POST: RequestHandler = async ({ request, fetch }) => {
  console.warn("This endpoint should be used for testing only!");
  const { plantId, fullPrompt, model } =
    (await request.json()) as GenImageTestToServer;

  console.log({ plantId, fullPrompt, model });
  const bodyJson: GenImageToBackground = {
    plantId,
    fullPrompt,
    model
  };

  const res = await fetch("/.netlify/functions/image-gen-background", {
    method: "POST",
    body: JSON.stringify(bodyJson)
  });

  return json(bodyJson, { status: 202 });

  // return json({}, { status: 202 });
};

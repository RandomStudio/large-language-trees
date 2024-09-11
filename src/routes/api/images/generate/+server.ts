import { json, type RequestHandler } from "@sveltejs/kit";
import type { GenerateImageRequest } from "$lib/types";
import { backgroundImageRequestBody } from "$lib/server/images";

export const POST: RequestHandler = async ({ request, fetch }) => {
  console.log(
    "Our API endpoint for intitating background function for image generation..."
  );
  const jsonBody = (await request.json()) as GenerateImageRequest;
  const { description, plantId, model, instructions } = jsonBody;

  const bodyJson = await backgroundImageRequestBody(
    plantId,
    description,
    instructions,
    model
  );

  const res = await fetch("/.netlify/functions/img-gen-background", {
    method: "POST",
    body: JSON.stringify(bodyJson)
  });

  // console.log("img gen background res:", res);

  return json(bodyJson, { status: res.status });
};

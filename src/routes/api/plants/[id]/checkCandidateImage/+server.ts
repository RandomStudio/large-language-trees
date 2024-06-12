import { db } from "$lib/server/db";
import { generatedImages } from "$lib/server/schema";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ params }) => {
  const plantId = params["id"];
  if (plantId) {
    const candidateImage = await db.query.generatedImages.findFirst({
      where: eq(generatedImages.plantId, plantId)
    });

    if (candidateImage) {
      return json(candidateImage, { status: 200 });
    } else {
      return json(undefined, { status: 404 });
    }
  } else {
    return error(400, "plantId param required");
  }
};

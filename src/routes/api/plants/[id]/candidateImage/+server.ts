import { db } from "$lib/server/db";
import { generatedImages } from "$lib/server/schema";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const GET: RequestHandler = async ({ params }) => {
  const plantId = params["id"];
  if (plantId) {
    const candidateImage = await db.query.generatedImages.findFirst({
      where: eq(generatedImages.plantId, plantId)
    });

    if (candidateImage) {
      return json(candidateImage, { status: 200 });
    } else {
      console.log("Candidate image not found; this is OK");
      return json({}, { status: 202 });
    }
  } else {
    return error(400, "plantId param required");
  }
};

export const POST: RequestHandler = async ({ request, params }) => {
  console.log("candidate image POST request");
  const plantId = params["id"];
  const { url } = (await request.json()) as { url: string };
  console.log("got", { url, plantId });
  if (plantId) {
    console.log({ url, plantId });
    const res = await db
      .insert(generatedImages)
      .values({
        id: uuidv4(),
        plantId,
        url
      })
      .returning();

    if (res.length > 0) {
      return json(res, { status: 201 });
    } else {
      return error(500, "Failed to insert new generated image URL");
    }
  } else {
    return error(400, "plantId param required");
  }
};

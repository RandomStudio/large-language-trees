import { db } from "$lib/server/db";
import { generatedPlants } from "$lib/server/schema";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3 } from "$lib/server/images";
import { URL_PREFIX } from "$lib/constants";
import type { GeneratedImage } from "$lib/types";
import { publishEvent } from "$lib/server/realtime";
import type { EventPlantGenerated } from "$lib/events.types";

/**
 * Should be identical to the version in
 * `netlify/functions/img-gen-background.mts`
 */
interface GenerateImageResultBody {
  url?: string | null;
  errorMessage?: string | null;
}

export const GET: RequestHandler = async ({ params }) => {
  const plantId = params["id"];
  if (plantId) {
    const candidateImage = await db.query.generatedPlants.findFirst({
      where: eq(generatedPlants.plantId, plantId)
    });

    if (candidateImage) {
      return json(candidateImage, { status: 200 });
    } else {
      return error(404);
    }
  } else {
    return error(400, "plantId param required");
  }
};

export const POST: RequestHandler = async ({ request, params }) => {
  console.log("candidate image POST request");
  const plantId = params["id"];
  const { url, errorMessage } =
    (await request.json()) as GenerateImageResultBody;
  console.log("got", { url, plantId, errorMessage });
  if (plantId) {
    console.log({ url, errorMessage, plantId });

    if (url) {
      console.log("Uploading to our storage first...");
      const resImageFromOpenAI = await fetch(url);
      const baseName = uuidv4();
      await uploadToS3(resImageFromOpenAI, baseName);
      const s3Url = URL_PREFIX + "/" + baseName + ".png";
      console.log("...Uploaded, now available at", s3Url);
      const res = await db
        .update(generatedPlants)
        .set({
          imageUrl: s3Url,
          errorMessage
        })
        .where(eq(generatedPlants.plantId, plantId))
        .returning();

      if (res.length > 0) {
        const { authorTop, authorBottom } = res[0];
        const e: EventPlantGenerated = {
          name: "newGeneratedPlantReady",
          payload: {
            plantId,
            authorTop,
            authorBottom
          }
        };
        await publishEvent(e);
        return json(res, { status: 201 });
      } else {
        return error(500, "Failed to insert new generated image URL");
      }
    } else {
      // The response is "OK" but we had no URL
      console.error("No URL; errorMessage ==", errorMessage);
      return json({ errorMessage, plantId }, { status: 200 });
    }
  } else {
    return error(400, "plantId param required");
  }
};

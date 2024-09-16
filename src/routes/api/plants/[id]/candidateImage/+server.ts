import { db } from "$lib/server/db";
import { generatedPlants } from "$lib/server/schema";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3 } from "$lib/server/images";
import { URL_PREFIX } from "$lib/constants";
import type { GeneratedImage } from "$lib/types";
import { publishEvent } from "$lib/server/realtime";
import type { EventGeneratedPlantReady } from "$lib/events.types";

/**
 * Should be identical to the version in
 * `netlify/functions/image-gen.mts`
 */
interface GenerateImageResultBody {
  url?: string | null;
  errorMessage?: string | null;
}

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
        const candidateReadyPlant = res[0];
        if (!candidateReadyPlant || !candidateReadyPlant.imageUrl) {
          throw Error("there should be an image URL for the version uploaded");
        }
        // Publish the event (now plant generated and ready)...
        const e: EventGeneratedPlantReady = {
          name: "newGeneratedPlantReady",
          payload: candidateReadyPlant
        };
        await publishEvent(e);

        // // Delete candidate plant entry...
        // const deleted = await db
        //   .delete(generatedPlants)
        //   .where(eq(generatedPlants.plantId, plantId))
        //   .returning();

        // if (deleted.length === 0) {
        //   throw Error(
        //     "failed to delete the entry, after it was finally confirmed!"
        //   );
        // }

        // Return response...
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

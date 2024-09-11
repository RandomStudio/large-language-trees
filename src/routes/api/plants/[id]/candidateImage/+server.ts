import { db } from "$lib/server/db";
import { generatedImages } from "$lib/server/schema";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3 } from "$lib/server/images";
import { URL_PREFIX } from "$lib/constants";
import type { GeneratedImage } from "$lib/types";

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
    const candidateImage = await db.query.generatedImages.findFirst({
      where: eq(generatedImages.plantId, plantId)
    });

    if (candidateImage) {
      return json(candidateImage, { status: 200 });
    } else {
      // Not found. This could be because the image has not yet been created.
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
        .insert(generatedImages)
        .values({
          id: uuidv4(),
          plantId,
          url: s3Url,
          errorMessage
        })
        .returning();

      if (res.length > 0) {
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

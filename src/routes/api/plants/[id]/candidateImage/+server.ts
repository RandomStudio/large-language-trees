import { db } from "$lib/server/db";
import { generatedImages } from "$lib/server/schema";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { CandidateImageBody } from "./types";
import { uploadToS3 } from "$lib/server/images";
import { URL_PREFIX } from "$lib/constants";

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
  const { url, errorMessage } = (await request.json()) as CandidateImageBody;
  console.log("got", { url, plantId });
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
    }
    // The response is "OK" but we had no URL
    return json({ url, errorMessage, plantId }, { status: 200 });
  } else {
    return error(400, "plantId param required");
  }
};

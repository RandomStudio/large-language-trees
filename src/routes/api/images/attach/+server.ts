import { db } from "$lib/server/db";
import { uploadToS3 } from "$lib/server/images";
import { plants } from "$lib/server/schema";
import type { AttachImageRequest, AttachImageResponse } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { URL_PREFIX } from "../../../../defaults/constants";

export const POST: RequestHandler = async ({ request }) => {
  console.log("POST images/attach");

  const { plantId, url } = (await request.json()) as AttachImageRequest;

  const resImageFromOpenAI = await fetch(url);

  const baseName = uuidv4();

  console.log({ resImageFromOpenAI });

  if (resImageFromOpenAI.status === 200) {
    console.log("Can fetch image OK; stream to S3...");
    await uploadToS3(resImageFromOpenAI, baseName);

    console.log("Now update plant entry with S3 URL...");
    const s3Url = URL_PREFIX + "/" + baseName + ".png";
    await db.update(plants).set({ imageUrl: s3Url }).returning();

    const finalResponse: AttachImageResponse = { plantId, url };
    return json(finalResponse, { status: 200 });
  } else {
    console.error(
      "Error requesting image from openAI URL:",
      resImageFromOpenAI.status
    );
    console.error(resImageFromOpenAI);
    return error(500, resImageFromOpenAI.statusText);
  }
};

import { db } from "$lib/server/db";
import { uploadToS3 } from "$lib/server/images";
import { plants } from "$lib/server/schema";
import type { AttachImageRequest, AttachImageResponse } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { URL_PREFIX } from "../../../../defaults/constants";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ request }) => {
  console.log("POST images/attach");

  const { plantId, url } = (await request.json()) as AttachImageRequest;

  await db
    .update(plants)
    .set({ imageUrl: url })
    .where(eq(plants.id, plantId))
    .returning();

  const finalResponse: AttachImageResponse = { plantId, url };
  return json(finalResponse, { status: 200 });
};

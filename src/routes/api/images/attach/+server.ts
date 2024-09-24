import { db } from "$lib/server/db";
import { uploadToS3 } from "$lib/server/images";
import { plants } from "$lib/server/schema";
import type { AttachImageRequest, AttachImageResponse } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { URL_PREFIX } from "$lib/constants";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ request }) => {
  console.log("POST images/attach");

  const { plantId, url } = (await request.json()) as AttachImageRequest;

  if (!plantId || !url) {
    console.error("missing params in body");
    return json({}, { status: 400, statusText: "missing params in body" });
  }

  const res = await db
    .update(plants)
    .set({ imageUrl: url })
    .where(eq(plants.id, plantId))
    .returning();

  return json(res, { status: res.length > 0 ? 200 : 202 });
};

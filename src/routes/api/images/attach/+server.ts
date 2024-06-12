import { db } from "$lib/server/db";
import { plants } from "$lib/server/schema";
import type { AttachImageRequest } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
  console.log("POST images/attach");

  const { plantId, url } = (await request.json()) as AttachImageRequest;

  const result = await db.update(plants).set({ imageUrl: url }).returning();

  return json({ result, plantId, url }, { status: 200 });
};

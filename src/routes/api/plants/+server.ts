import { addNewPlant } from "$lib/server";
import { db } from "$lib/server/db";
import { plants } from "$lib/server/schema";
import type { InsertPlant } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () =>
  json(await db.select().from(plants));

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as InsertPlant;
  const result = await addNewPlant(data);
  return json(result, { status: 201 });
};

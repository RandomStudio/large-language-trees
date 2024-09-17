import { db } from "$lib/server/db";
import { generatedPlants } from "$lib/server/schema";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () =>
  json(await db.select().from(generatedPlants));

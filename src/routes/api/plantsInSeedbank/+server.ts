import { db } from "$lib/server/db";
import { seedbanksToPlants } from "$lib/server/schema";
import type { SeedbankEntry } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as SeedbankEntry;

  console.log("POST plantsInSeedbank", data);

  const result = await db.insert(seedbanksToPlants).values(data).returning();

  return json(result[0], { status: 201 });
};

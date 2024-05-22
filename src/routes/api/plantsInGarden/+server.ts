import { db } from "$lib/server/db";
import { gardensToPlants } from "$lib/server/schema";
import type { GardenPlantEntry } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

export const PATCH: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as GardenPlantEntry;

  const result = await db
    .update(gardensToPlants)
    .set({ ...data })
    .where(
      and(
        eq(gardensToPlants.gardenId, data.gardenId),
        eq(gardensToPlants.plantId, data.plantId)
      )
    );

  return json(result[0], { status: 200 });
};

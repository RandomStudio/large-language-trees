import { db } from "$lib/server/db";
import { gardens, gardensToPlants } from "$lib/server/schema";
import type { GardenPlantEntry } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { pickRandomIndex } from "random-elements";
import { GRID_HEIGHT, GRID_WIDTH } from "../../../defaults/constants";

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as GardenPlantEntry;
  const { gardenId, colIndex, rowIndex } = data;

  console.log("POST plantsInGarden", data);

  // First, check that the requested colIndex and rowIndex is
  // currently empty. Otherwise, find another spot.

  // Random for now, will use something like random walk in future...
  const otherPlants = await db.query.gardensToPlants.findMany({
    where: eq(gardensToPlants.gardenId, gardenId),
  });

  let c = colIndex;
  let r = rowIndex;

  while (
    otherPlants.find((entry) => entry.colIndex === c && entry.rowIndex === r)
  ) {
    c = Math.floor(Math.random() * GRID_WIDTH);
    r = Math.floor(Math.random() * GRID_HEIGHT);
  }

  console.log("Found empty spot:", { column: c, row: r });

  const result = await db
    .insert(gardensToPlants)
    .values({ ...data, rowIndex: r, colIndex: c })
    .returning();

  return json(result[0], { status: 201 });
};

export const PATCH: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as GardenPlantEntry;

  console.log("PATCH plantsInGarden:", data);

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

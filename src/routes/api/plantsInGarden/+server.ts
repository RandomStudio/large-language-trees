import { db } from "$lib/server/db";
import { gardens, gardensToPlants } from "$lib/server/schema";
import type { GardenPlantEntry } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { pickRandomIndex } from "random-elements";
import { GRID_HEIGHT, GRID_WIDTH } from "../../../defaults/constants";
import { SHARED_GARDEN_USERID } from "$env/static/private";

const findEmpty = (
  otherPlants: GardenPlantEntry[],
  closeTo: { row: number; col: number }
) => {
  let col = closeTo.col;
  let row = closeTo.row;

  while (
    otherPlants.find(
      (entry) => entry.colIndex === col && entry.rowIndex === row
    )
  ) {
    col = Math.floor(Math.random() * GRID_WIDTH);
    row = Math.floor(Math.random() * GRID_HEIGHT);
  }

  return { col, row };
};

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

  const { col, row } = findEmpty(otherPlants, { row: rowIndex, col: colIndex });

  console.log("Found empty spot:", { col, row });

  const result = await db
    .insert(gardensToPlants)
    .values({ ...data, rowIndex: row, colIndex: col })
    .returning();

  if (SHARED_GARDEN_USERID) {
    console.warn(
      "SHARED_GARDEN_USERID env variable is active; will also add this plant to default garden"
    );
    const { col, row } = findEmpty(otherPlants, {
      row: rowIndex,
      col: colIndex,
    });
    const defaultGarden = await db.query.gardens.findFirst({
      where: eq(gardens.userId, SHARED_GARDEN_USERID),
    });
    if (defaultGarden) {
      const result2 = await db
        .insert(gardensToPlants)
        .values({
          ...data,
          rowIndex: row,
          colIndex: col,
          gardenId: defaultGarden.id,
        })
        .returning();
      console.log("Added to default garden as entry", result2);
    } else {
      console.error("Where is the default user's garden?");
    }
  }

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

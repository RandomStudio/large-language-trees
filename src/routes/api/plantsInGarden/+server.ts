import { db } from "$lib/server/db";
import { gardensToPlants } from "$lib/server/schema";
import type { GardenPlantEntry } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import {
  addPlantToGarden,
  getUserByUsername,
  getUserGarden
} from "$lib/server";
import { ADMIN_GARDEN_SHARED } from "$env/static/private";

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as { plantId: string; gardenId: string };
  const { gardenId, plantId } = data;

  console.log("POST plantsInGarden", data);

  await addPlantToGarden(plantId, gardenId);

  if (ADMIN_GARDEN_SHARED === "true") {
    console.warn(
      "ADMIN_GARDEN_SHARED enabled; also add this plant to admin garden"
    );
    const adminUser = await getUserByUsername("admin");
    if (adminUser) {
      const adminGarden = await getUserGarden(adminUser.id);
      if (adminGarden) {
        const exists = await db
          .select()
          .from(gardensToPlants)
          .where(
            and(
              eq(gardensToPlants.plantId, plantId),
              eq(gardensToPlants.gardenId, gardenId)
            )
          );
        if (exists.length === 0) {
          await addPlantToGarden(plantId, adminGarden.id);
          console.log("...added to admin user garden OK");
        } else {
          console.log("...already exist in garden; skip");
        }
      }
    }
  }

  return json(data, { status: 201 });
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

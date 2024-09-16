import { db } from "$lib/server/db";
import { gardens, gardensToPlants } from "$lib/server/schema";
import type { GardenPlantEntry } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import {
  addPlantToGarden,
  getUserByUsername,
  getUserGardenWithPlants
} from "$lib/server";
import { ADMIN_GARDEN_SHARED } from "$env/static/private";

export interface PostPlantToGardenBody {
  plantId: string;
  gardenId?: string;
  userId?: string;
}

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as PostPlantToGardenBody;

  const { gardenId, plantId, userId } = data;

  console.log("POST plantsInGarden", data);

  if (!gardenId && !userId) {
    console.error("Not enough information to add plant to garden", {
      plantId,
      userId,
      gardenId
    });
    return json(
      {},
      {
        status: 400,
        statusText: "Not enough information to add plant to garden!"
      }
    );
  }
  if (gardenId) {
    await addPlantToGarden(plantId, gardenId);
  } else {
    console.log(
      "No gardenId provided, will search for garden with userId",
      userId,
      "..."
    );
    if (!userId) {
      return json(
        {},
        {
          status: 400,
          statusText:
            "If no gardenId is provided, userId must be provided instead"
        }
      );
    }
    const garden = await db.query.gardens.findFirst({
      where: eq(gardens.userId, userId)
    });
    if (!garden) {
      throw Error("Failed to find garden matching userID " + userId);
    }
    await addPlantToGarden(plantId, garden.id);
  }

  // if (ADMIN_GARDEN_SHARED === "true") {
  //   console.warn(
  //     "ADMIN_GARDEN_SHARED enabled; also add this plant to admin garden"
  //   );
  //   const adminUser = await getUserByUsername("admin");
  //   if (adminUser) {
  //     const adminGarden = await getUserGarden(adminUser.id);
  //     if (adminGarden) {
  //       const exists = await db
  //         .select()
  //         .from(gardensToPlants)
  //         .where(
  //           and(
  //             eq(gardensToPlants.plantId, plantId),
  //             eq(gardensToPlants.gardenId, gardenId)
  //           )
  //         );
  //       if (exists.length === 0) {
  //         await addPlantToGarden(plantId, adminGarden.id);
  //         console.log("...added to admin user garden OK");
  //       } else {
  //         console.log("...already exist in garden; skip");
  //       }
  //     }
  //   }
  // }

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

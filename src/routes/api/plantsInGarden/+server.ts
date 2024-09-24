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

  return json(data, { status: 201 });
};

export const GET: RequestHandler = async ({ url }) => {
  const userId = url.searchParams.get("userId");
  const gardenId = url.searchParams.get("gardenId");
  if (!userId && !gardenId) {
    return json([], {
      status: 400,
      statusText: "userId or gardenId required in urlsearchparams"
    });
  }
  let garden = null;
  if (userId) {
    garden = await db.query.gardens.findFirst({
      with: { plants: { with: { plant: true } } },
      where: eq(gardens.userId, userId)
    });
  }
  if (gardenId) {
    garden = await db.query.gardens.findFirst({
      with: { plants: { with: { plant: true } } },
      where: eq(gardens.id, gardenId)
    });
  }
  if (!garden) {
    return json([], { status: 404, statusText: "garden not found for user" });
  }
  const plants = garden.plants.map((p) => p.plant);
  return json(plants, { status: 200 });
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
    )
    .returning();

  return json(result[0], { status: 200 });
};

export const DELETE: RequestHandler = async ({ request, url }) => {
  const gardenId = url.searchParams.get("gardenId");
  const plantId = url.searchParams.get("plantId");

  if (gardenId) {
    console.warn(
      "Deleting all plantsInGarden entries where gardenId ==",
      gardenId
    );
    const result = await db
      .delete(gardensToPlants)
      .where(eq(gardensToPlants.gardenId, gardenId))
      .returning();
    return json(result, { status: result.length > 0 ? 200 : 202 });
  }
  if (plantId) {
    const result = await db
      .delete(gardensToPlants)
      .where(eq(gardensToPlants.plantId, plantId))
      .returning();
    return json(result, { status: result.length > 0 ? 200 : 202 });
  }

  return json(
    {},
    {
      status: 400,
      statusText:
        "Must provide either gardenId or plantId in request URL searchparams"
    }
  );
};

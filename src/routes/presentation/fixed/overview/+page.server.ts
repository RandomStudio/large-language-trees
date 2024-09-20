import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";
import { gardensToPlants, plants } from "$lib/server/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({}) => {
  // We get all plants from all gardens, but no duplicates!
  const gardenWithPlants = await db
    .selectDistinctOn([gardensToPlants.plantId], {
      plantId: gardensToPlants.plantId,
      imageUrl: plants.imageUrl
    })
    .from(gardensToPlants)
    .leftJoin(plants, eq(gardensToPlants.plantId, plants.id));

  return {
    gardenWithPlants
  };
};

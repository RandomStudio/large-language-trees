import { LIMIT_LEADERBOARD } from "$lib/constants";
import { stripUserInfo } from "$lib/security";
import { db } from "$lib/server/db";
import { gardens } from "$lib/server/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import type { GardenWithPlants } from "$lib/types";

export const load: PageServerLoad = async () => {
  const gardenPlants = await db.query.gardens.findMany({
    with: { plants: true, myOwner: true }
  });

  const gardensWithPlantCounts = gardenPlants
    .filter((g) => g.myOwner.isAdmin === false)
    .map((g) => ({
      gardenId: g.id,
      user: stripUserInfo(g.myOwner),
      count: g.plants.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, LIMIT_LEADERBOARD);

  console.log({ gardensWithPlantCounts });

  const topGarden = gardensWithPlantCounts[0];

  if (!topGarden) {
    console.error("no topGarden");
    return { topGarden: null, gardensWithPlantCounts: [] };
  }

  const topGardenWithPlants = await db.query.gardens.findFirst({
    where: eq(gardens.id, topGarden.gardenId),
    with: { plants: { with: { plant: true } } }
  });

  if (!topGardenWithPlants) {
    throw Error("no topGardenWithPlants");
  }

  // console.log(JSON.stringify({ topGardenWithPlants }));

  const topGardenWithPlantsTyped: GardenWithPlants = {
    id: topGardenWithPlants.id,
    name: topGardenWithPlants.name,
    userId: topGardenWithPlants.userId,
    plants: topGardenWithPlants.plants.map((p) => p.plant)
  };

  return {
    gardensWithPlantCounts,
    topGardenWithPlants: topGardenWithPlantsTyped
  };
};

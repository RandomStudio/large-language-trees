import { LIMIT_LEADERBOARD } from "$lib/constants";
import { stripUserInfo } from "$lib/security";
import { db } from "$lib/server/db";
import { gardens, gardensToPlants } from "$lib/server/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({}) => {
  const gardenPlants = await db.query.gardens.findMany({
    with: { plants: true, myOwner: true }
  });

  const gardensWithPlantCounts = gardenPlants
    .map((g) => ({ user: stripUserInfo(g.myOwner), count: g.plants.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, LIMIT_LEADERBOARD);

  console.log({ gardensWithPlantCounts });

  return { gardensWithPlantCounts };
};

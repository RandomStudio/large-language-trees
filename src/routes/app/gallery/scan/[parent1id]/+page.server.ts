import { db } from "$lib/server/db";
import { plants, users } from "$lib/server/schema";
import type { ScanStartData } from "$lib/types";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { stripUserInfo } from "$lib/security";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({
  locals,
  params,
  url,
  parent
}): Promise<ScanStartData> => {
  const userId = locals.user?.id || url.searchParams.get("userId");
  if (!userId) {
    throw Error("No user ID for this user!");
  }
  const userWithSeedbankPlants = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      myGarden: true,
      mySeedbank: { with: { plantsInSeedbank: { with: { plant: true } } } }
    }
  });

  if (!userWithSeedbankPlants) {
    throw Error("error finding plant and/or user");
  }

  const plantId = params.parent1id;

  if (!plantId) {
    return error(400);
  }

  const userPlants = userWithSeedbankPlants.mySeedbank.plantsInSeedbank.map(
    (p) => p.plant
  );

  const thisPlant = userWithSeedbankPlants.mySeedbank.plantsInSeedbank.find(
    (p) => p.plantId === plantId
  );

  if (!thisPlant) {
    throw Error("could not find this plant");
  }

  return {
    thisUser: stripUserInfo(userWithSeedbankPlants),
    userPlants,
    thisPlant: thisPlant.plant
  };
};

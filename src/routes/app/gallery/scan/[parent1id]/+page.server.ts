import { db } from "$lib/server/db";
import { users } from "$lib/server/schema";
import type { ScanStartData } from "$lib/types";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { stripUserInfo } from "$lib/security";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({
  locals,
  params,
  url
}): Promise<ScanStartData> => {
  const userId = locals.user?.id || url.searchParams.get("userId");
  if (!userId) {
    throw Error("No user ID for this user!");
  }
  const userWithGarden = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      myGarden: { with: { plants: { with: { plant: true } } } }
    }
  });

  if (!userWithGarden) {
    throw Error("error finding plant and/or user");
  }

  const plantId = params.parent1id;

  if (!plantId) {
    return error(400);
  }

  const userPlants = userWithGarden.myGarden.plants.map((p) => p.plant);

  const thisPlant = userWithGarden.myGarden.plants.find(
    (p) => p.plantId === plantId
  );

  if (!thisPlant) {
    throw Error("could not find this plant");
  }

  console.log({ userWithGarden });

  return {
    thisUser: stripUserInfo(userWithGarden),
    userPlants,
    thisPlant: thisPlant.plant
  };
};

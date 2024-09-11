import { db } from "$lib/server/db";
import { plants, users } from "$lib/server/schema";
import type { ScanStartData } from "$lib/types";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { stripUserInfo } from "$lib/security";

export const load: PageServerLoad = async ({
  locals,
  params,
  url
}): Promise<ScanStartData> => {
  const userId = locals.user?.id;
  if (!userId) {
    throw Error("No user ID for this user!");
  }
  const thisUser = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  const plantId = params.parent1id;

  const thisPlant = await db.query.plants.findFirst({
    where: eq(plants.id, plantId)
  });

  if (!thisUser || !thisPlant) {
    throw Error("error finding plant and/or user");
  }
  return {
    thisUser: stripUserInfo(thisUser),
    thisPlant
  };
};

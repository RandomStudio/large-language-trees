import { getUserGarden, getUserSeeds } from "$lib/server";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";
import type { EnhancedGardenViewData } from "$lib/types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { users } from "$lib/server/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
  locals,
  params,
  url
}): Promise<EnhancedGardenViewData> => {
  const userId = locals.user?.id;

  console.log("******** (re)load page data");
  if (userId) {
    const garden = await getUserGarden(userId);
    const seedBank = await getUserSeeds(userId);
    console.log("...ready to render");
    const thisUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { mySeedbank: true }
    });
    let otherUserId = null;
    const otherUserUsername = url.searchParams.get("authorBottom");
    if (otherUserUsername) {
      const otherUser = await db.query.users.findFirst({
        where: eq(users.username, otherUserUsername)
      });
      if (otherUser) {
        otherUserId = otherUser.id;
      }
    }
    const plantId = params.id;
    if (thisUser && plantId) {
      return {
        // TODO: just load the user seedbank (including its seeds, not seeds + seedbankId separately)
        user: thisUser,
        seedbank: seedBank,
        garden,
        plantId,
        otherPlantId: url.searchParams.get("parent2"),
        otherUserId
      };
    } else {
      throw Error("could not find user when querying");
    }
  } else {
    throw Error("userId missing");
  }
};

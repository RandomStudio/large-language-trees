import type { PageServerLoad } from "./$types";
import { getUserGarden, getUserSeeds } from "$lib/server";
import { redirect } from "@sveltejs/kit";
import type { GardenViewData } from "$lib/types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { users } from "$lib/server/schema";

export const load: PageServerLoad = async ({
  locals
}): Promise<GardenViewData> => {
  const username = locals.user?.username;
  const userId = locals.user?.id;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/app");
  }

  console.log("******** (re)load page data");
  if (userId) {
    const garden = await getUserGarden(userId);
    const seedBank = await getUserSeeds(userId);
    console.log("...ready to render");
    const thisUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { mySeedbank: true }
    });
    if (thisUser) {
      return {
        // TODO: just load the user seedbank (including its seeds, not seeds + seedbankId separately)
        user: thisUser,
        seedBank,
        garden
      };
    } else {
      throw Error("could not find user when querying");
    }
  } else {
    throw Error("userId missing");
  }
};

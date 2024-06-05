import type { PageServerLoad } from "./$types";
import {
  checkDefaultUsers,
  checkPlantsExist,
  getUserGarden,
  getUserSeeds,
} from "$lib/server/server";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";
import type { GardenViewData } from "$lib/types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { users } from "$lib/server/schema";

export const load: PageServerLoad = async ({
  locals,
}): Promise<GardenViewData> => {
  const username = locals.user?.username;
  const userId = locals.user?.id;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/login");
  }

  console.log("******** (re)load page data");
  if (userId) {
    console.log("running checks, loading data after authorisation...");
    await checkPlantsExist();
    await checkDefaultUsers();
    const garden = await getUserGarden(userId);
    const seedBank = await getUserSeeds(userId);
    console.log("...ready to render");
    const thisUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { mySeedbank: true },
    });
    if (thisUser) {
      return {
        // TODO: just load the user seedbank (including its seeds, not seeds + seedbankId separately)
        user: thisUser,
        seedBank,
        garden,
      };
    } else {
      throw Error("could not find user when querying");
    }
  } else {
    throw Error("userId missing");
  }
};

export const actions: Actions = {
  logout: async (event) => {
    if (!event.locals.session) {
      return fail(401);
    }
    await lucia.invalidateSession(event.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });
    redirect(302, "/");
  },
};

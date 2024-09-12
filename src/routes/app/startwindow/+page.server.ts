import type { PageServerLoad } from "./$types";
import { getUserGarden, getUserSeeds } from "$lib/server";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  const userId = locals.user?.id;

  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/app");
  }

  if (!userId) {
    throw Error("userId missing");
  }

  console.log("******** (re)load page data");

  const seedBank = await getUserSeeds(userId);
  return {
    startPlant: seedBank.plantsInSeedbank[0].plant
  };
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
      ...sessionCookie.attributes
    });
    redirect(302, "/");
  }
};

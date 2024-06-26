import type { PageServerLoad } from "./$types";
import { checkPlantsExist, getUserGarden, getUserSeeds } from "$lib/server";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  const userId = locals.user?.id;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/login");
  }

  console.log("******** (re)load page data");
  if (userId) {
    checkPlantsExist();
    const garden = await getUserGarden(userId);
    const seeds = await getUserSeeds(userId);
    return { seeds, newSeed: null, username, garden };
  } else {
    throw Error("userId missing");
  }
};

export const actions: Actions = {
  // This is for logout
  default: async (event) => {
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

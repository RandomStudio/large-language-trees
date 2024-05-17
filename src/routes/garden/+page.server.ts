import type { PageServerLoad } from "./$types";
import { getAllPlants } from "$lib/server/server";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/login");
  }

  console.log("******** (re)load page data");
  const seeds = await getAllPlants();
  return { seeds, newSeed: null, username };
};

export const actions: Actions = {
  default: async (event) => {
    if (!event.locals.session) {
      return fail(401);
    }
    await lucia.invalidateSession(event.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });
    redirect(302, "/login");
  },
};

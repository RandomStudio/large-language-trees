import type { PageServerLoad } from "./$types";
import { checkPlantsExist, getUserGarden, getUserSeeds } from "$lib/server";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  const userId = locals.user?.id;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/app");
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

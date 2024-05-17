import type { PageServerLoad } from "./$types";
import { getAllPlants } from "$lib/server/server";
import { redirect } from "@sveltejs/kit";

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

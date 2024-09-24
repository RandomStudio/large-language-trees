import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/app");
  }

  const plantsInGardens = await db.query.gardensToPlants.findMany({
    with: { plant: true, garden: { with: { myOwner: true } } }
  });

  return { plantsInGardens };
};

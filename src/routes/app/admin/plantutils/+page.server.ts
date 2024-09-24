import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { db } from "$lib/server/db";
import { isNotNull, or } from "drizzle-orm";
import { plants } from "$lib/server/schema";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/app");
  }

  const plantsWithOwners = await db.query.plants.findMany({
    with: { authorTopUser: true, authorBottomUser: true },
    where: or(isNotNull(plants.authorTop), isNotNull(plants.authorBottom))
  });

  return { plantsWithOwners };
};

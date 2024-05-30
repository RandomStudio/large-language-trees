import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { users } from "$lib/server/schema";
import { lucia } from "$lib/server/auth";
import {
  checkDefaultUsers,
  checkPlantsExist,
  cleanUp,
  getUserGarden,
  getUserSeeds,
} from "$lib/server/server";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  const userId = locals.user?.id;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/login");
  }

  if (userId) {
    await checkPlantsExist();
    await checkDefaultUsers();
    const garden = await getUserGarden(userId);
    const seeds = await getUserSeeds(userId);

    const thisUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (thisUser?.isAdmin === true) {
      console.log("Admin user authorised");
      return { username, isAdmin: true };
    } else {
      console.error(`User ${userId} is not an admin; not authorised`);
      redirect(302, "/login");
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
  reset: async (event) => {
    console.warn("Full reset happening!");
    await cleanUp();
    redirect(302, "/");
  },
};

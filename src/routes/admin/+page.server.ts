import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { plants, users } from "$lib/server/schema";
import { lucia } from "$lib/server/auth";
import {
  cleanUp,
  createNewGarden,
  getUserByUsername,
  populateDefaultPlants
} from "$lib/server";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  const userId = locals.user?.id;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/");
  }

  if (userId) {
    const allPlants = await db.select().from(plants);

    const thisUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    if (thisUser?.isAdmin === true) {
      console.log("Admin user authorised");
      return { username, isAdmin: true, allPlants };
    } else {
      console.error(`User ${userId} is not an admin; not authorised`);
      redirect(302, "/logout");
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
      ...sessionCookie.attributes
    });
    redirect(302, "/");
  },
  reset: async (_event) => {
    console.warn("Full reset happening!");
    await cleanUp();
    redirect(302, "/");
  },
  initplants: async (_event) => {
    console.warn("Plants initialisation...");
    await populateDefaultPlants();
    console.log("Also create admin garden...");
    const adminUser = await getUserByUsername("admin");
    if (adminUser) {
      await createNewGarden(adminUser.id, adminUser.username);
    } else {
      throw Error("No admin user found");
    }
  }
};

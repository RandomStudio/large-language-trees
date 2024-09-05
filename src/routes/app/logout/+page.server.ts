import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { users } from "$lib/server/schema";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  const userId = locals.user?.id;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/app");
  }

  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    return { username, isAdmin: user?.isAdmin || false };
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
    redirect(302, "/app");
  }
};

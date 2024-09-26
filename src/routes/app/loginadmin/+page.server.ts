import { lucia } from "$lib/server/auth";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { users } from "$lib/server/schema";

export const actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get("username");
    const password = formData.get("password");
    console.log("attempt admin login");

    if (!username || typeof username !== "string") {
      throw Error("username is not valid string");
    }
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (!existingUser) {
      return fail(400, {
        message: "Could not log in with existing username",
        existingUser: null
      });
    }

    if (!password || typeof password !== "string") {
      throw Error("password not submitted with form");
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });

    if (!validPassword) {
      console.error("Validation failure");
      return fail(400, {
        message: "Incorrect username or password"
      });
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });

    console.log("Valid admin password, redirecting to menu...");
    redirect(302, "/app/admin");
  }
} satisfies Actions;

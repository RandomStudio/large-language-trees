import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { verify } from "@node-rs/argon2";

import type { Actions } from "./$types";
import { db } from "$lib/server/db";
import { users } from "$lib/server/schema";
import { eq } from "drizzle-orm";
import { checkDefaultUsers } from "$lib/server/server";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";

export const load = async ({ locals }) => {
  await checkDefaultUsers();

  const username = locals.user?.username;
  const userId = locals.user?.id;
  if (username) {
    console.log("You are already logged in!");
    redirect(302, "/gallery");
  }
};

export const actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

    if (
      typeof username !== "string" ||
      username.length < 3 ||
      username.length > 31 ||
      !/^[a-z0-9_-]+$/.test(username)
    ) {
      console.error("invalid username");
      return fail(400, {
        message: "Invalid username",
      });
    }
    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      console.error("invalid password");
      return fail(400, {
        message: "Invalid password",
      });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username.toLowerCase()),
    });

    if (!existingUser) {
      const userId = generateIdFromEntropySize(10); // 16 characters long
      const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      // TODO: check if username is already used
      await db.insert(users).values({
        id: userId,
        username,
        passwordHash,
      });

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes,
      });

      redirect(302, "/startwindow");


    }
    else {


      const validPassword = await verify(existingUser.passwordHash, password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      if (!validPassword) {
        console.error("Validation failure");
        return fail(400, {
          message: "Incorrect username or password",
        });
      }

      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes,
      });

      redirect(302, "/gallery");
    }
  }
} satisfies Actions;

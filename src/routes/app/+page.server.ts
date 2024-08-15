import { lucia } from "$lib/server/auth";
import { fail, redirect, type RequestEvent } from "@sveltejs/kit";
import type { Actions, RouteParams } from "./$types";
import { db } from "$lib/server/db";
import { users } from "$lib/server/schema";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { publishEvent } from "$lib/server/realtime";
import type { EventNewUser } from "$lib/events.types";
import { LIMIT_CHARACTERS_USERNAME } from "$lib/constants";
import type { SelectUser } from "$lib/types";
import { stripUserInfo } from "$lib/security";

export const load = async ({ locals }) => {
  const username = locals.user?.username;
  if (username) {
    console.log(`${username} was already logged in; simply redirect`);
    redirect(302, "/app/gallery");
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
      username.length > LIMIT_CHARACTERS_USERNAME ||
      !/^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]+$/.test(username)
    ) {
      console.error("invalid username");
      return fail(400, {
        message: "Invalid username",
        existingUser: null
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
        existingUser: null
      });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username.toLowerCase())
    });

    if (!existingUser) {
      // This is NOT an existing user, so attempt to auto-register new user

      const userId = generateIdFromEntropySize(10); // 16 characters long
      const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
      });

      const isAdmin = username === "admin";
      const newUser = {
        id: userId,
        username,
        passwordHash,
        isAdmin
      };
      console.log(
        "Auto register; create new user",
        { userId, username, isAdmin },
        "..."
      );
      await db.insert(users).values(newUser);

      await createNewUserSession(newUser, event);

      if (username === "admin") {
        redirect(302, "/app/admin");
      } else {
        const e: EventNewUser = {
          name: "newUser",
          payload: { userId, username }
        };
        await publishEvent(e);
        redirect(302, "/app/startwindow");
      }
    } else {
      // This is an existing user, so reject

      return fail(400, {
        message: "That username already exists",
        existingUser: stripUserInfo(existingUser)
      });
    }
  }
} satisfies Actions;
async function createNewUserSession(
  existingUser: SelectUser,
  event: RequestEvent<RouteParams, "/app">
) {
  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  event.cookies.set(sessionCookie.name, sessionCookie.value, {
    path: ".",
    ...sessionCookie.attributes
  });
}

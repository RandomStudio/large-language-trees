import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { verify } from "@node-rs/argon2";
import type { Actions } from "./$types";
import { db } from "$lib/server/db";
import { users } from "$lib/server/schema";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { publishEvent } from "$lib/server/realtime";
import type { EventNewUser } from "$lib/events.types";

export const load = async ({ locals }) => {
  const username = locals.user?.username;
  if (username) {
    console.log("You are already logged in!");
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
      username.length > 31 ||
      !/^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]+$/.test(username)
    ) {
      console.error("invalid username");
      return fail(400, {
        message: "Invalid username"
      });
    }
    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      console.error("invalid password");
      return fail(400, {
        message: "Invalid password"
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

      const alreadyExists = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      if (alreadyExists.length > 0) {
        return fail(400, { message: "That username already exists" });
      }

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

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      });

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
      // This is an existing user, so try to log in
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

      if (username === "admin") {
        redirect(302, "/app/admin");
      } else {
        redirect(302, "/app/gallery");
      }
    }
  }
} satisfies Actions;

import { stripUserInfo } from "$lib/security";
import { db } from "$lib/server/db";
import { users } from "$lib/server/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ params }) => {
  const id = params["id"];
  if (id) {
    const user = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (user) {
      const { username, id } = stripUserInfo(user);
      return json({ username, id }, { status: 200 });
    } else {
      return json(
        {},
        { status: 404, statusText: `user not found for id "${id}"` }
      );
      // throw Error(`user not found for id "${id}"`);
    }
  } else {
    throw Error("Param missing");
  }
};

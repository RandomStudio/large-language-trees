import { db } from "$lib/server/db";
import { users } from "$lib/server/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ params }) => {
  const id = params["id"];
  if (id) {
    const user = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (user) {
      return json(user, { status: 200 });
    } else {
      throw Error("user not found");
    }
  } else {
    throw Error("Param missing");
  }
};

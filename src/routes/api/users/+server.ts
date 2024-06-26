import { db } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({}) => {
  const users = await db.query.users.findMany();
  return json({ count: users.length }, { status: 200 });
};

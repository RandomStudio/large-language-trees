import { stripUserInfo } from "$lib/security";
import { db } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
  const users = await db.query.users.findMany();
  return json(
    { users: users.map((u) => stripUserInfo(u)), count: users.length },
    { status: 200 }
  );
};

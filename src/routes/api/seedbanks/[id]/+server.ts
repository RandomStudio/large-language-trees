import { db } from "$lib/server/db";
import { seedbanks } from "$lib/server/schema";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ params }) => {
  if (params.id) {
    const seedbank = await db.query.seedbanks.findFirst({
      where: eq(seedbanks.id, params.id)
    });
    if (seedbank) {
      return json(seedbank);
    } else {
      return error(404);
    }
  } else {
    return error(400, "id required");
  }
};

import { db } from "$lib/server/db";
import { generatedPlants } from "$lib/server/schema";
import { type RequestHandler, json } from "@sveltejs/kit";
import { eq, or } from "drizzle-orm";

export const GET: RequestHandler = async ({ params, url }) => {
  const plantId = params["id"];
  const userId = url.searchParams.get("userid");

  if (plantId) {
    const matchingCandidatePlant = await db.query.generatedPlants.findFirst({
      where: eq(generatedPlants.plantId, plantId)
    });

    if (matchingCandidatePlant) {
      return json(matchingCandidatePlant, { status: 200 });
    } else {
      return json({}, { status: 404 });
    }
  } else if (userId) {
    // Search with userID for EITHER authorTop or authorBottom
    const matchingCandidatePlant = await db.query.generatedPlants.findFirst({
      where: or(
        eq(generatedPlants.authorTop, userId),
        eq(generatedPlants.authorBottom, userId)
      )
    });

    if (matchingCandidatePlant) {
      return json(matchingCandidatePlant, { status: 200 });
    } else {
      return json({}, { status: 404 });
    }
  } else {
    return json(
      {},
      { status: 400, statusText: "either userId or plantId must be provided" }
    );
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  const plantId = params["id"];

  if (!plantId) {
    throw Error("no plantID provided");
  }

  const matchingCandidatePlant = await db.query.generatedPlants.findFirst({
    where: eq(generatedPlants.plantId, plantId)
  });

  if (matchingCandidatePlant) {
    const result = await db
      .delete(generatedPlants)
      .where(eq(generatedPlants.plantId, plantId))
      .returning();
    if (result.length !== 1) {
      throw Error(`count ${result.length} is not a single entry`);
    }
    return json(result, { status: 202 });
  } else {
    return json([], { status: 404 });
  }
};

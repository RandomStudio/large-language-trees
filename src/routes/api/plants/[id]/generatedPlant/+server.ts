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
      console.log(
        "No matching candidate plant (text generation) for plantID",
        plantId,
        "... this is OK"
      );
      return json({}, { status: 202 });
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
      console.log(
        "No matching candidate plant (generated candidate) for userID",
        userId,
        "... this is OK"
      );
      return json({}, { status: 202 });
    }
  } else {
    throw Error("either plantID or userID must be provided");
  }
};
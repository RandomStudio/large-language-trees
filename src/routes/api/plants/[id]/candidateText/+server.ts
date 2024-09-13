import { db } from "$lib/server/db";
import { generatedPlants } from "$lib/server/schema";
import type { GenerateImageRequest, InsertPlant } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq, or } from "drizzle-orm";

/** Should be identical to the interface in
 * `/netlify/functions/complete-gen-background.mts`
 */
interface CandidateTextBody {
  authorTop: string;
  authorBottom: string;
  contents?: string;
  errorMessage?: string;
}

/*
  This is the endpoint used by the BACKGROUND GENERATION FUNCTION (text)
  once it has a valid result (a new candidate plant)...
*/
export const POST: RequestHandler = async ({ params, request, fetch }) => {
  console.log(
    "Attempt to insert new candidate plant (text generation result)..."
  );
  const plantId = params["id"];
  if (!plantId) {
    throw Error("plant ID param required");
  }

  const candidateTextBody = (await request.json()) as CandidateTextBody;

  const { authorTop, authorBottom, contents, errorMessage } = candidateTextBody;

  const resInsert = await db
    .insert(generatedPlants)
    .values({ authorTop, authorBottom, plantId, contents, errorMessage })
    .returning();

  return json(resInsert, { status: 201 });
};

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

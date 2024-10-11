import { db } from "$lib/server/db";
import { generatedPlants } from "$lib/server/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

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
export const POST: RequestHandler = async ({ params, request }) => {
  console.log(
    "Attempt to update new candidate plant (text generation result)..."
  );
  const plantId = params["id"];
  if (!plantId) {
    throw Error("plant ID param required");
  }

  const candidateTextBody = (await request.json()) as CandidateTextBody;

  const { contents, errorMessage } = candidateTextBody;

  const resInsert = await db
    .update(generatedPlants)
    .set({ contents, errorMessage })
    .where(eq(generatedPlants.plantId, plantId))
    .returning();

  return json(resInsert, { status: 201 });
};

/*
  This is the endpoint used by the BACKGROUND GENERATION FUNCTION (text)
  typically to update with an ERROR MESSAGE
*/
export const PATCH: RequestHandler = async ({ params, request }) => {
  const plantId = params["id"];
  if (!plantId) {
    throw Error("plant ID param required");
  }

  const candidateTextBody = (await request.json()) as CandidateTextBody;

  const { contents, errorMessage } = candidateTextBody;

  const resInsert = await db
    .update(generatedPlants)
    .set({ contents, errorMessage })
    .where(eq(generatedPlants.plantId, plantId))
    .returning();

  return json(resInsert, { status: 201 });
};

import { db } from "$lib/server/db";
import { generatedText } from "$lib/server/schema";
import type { GenerateImageRequest, InsertPlant } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

/** Should be identical to the interface in
 * `/netlify/functions/complete-gen-background.mts`
 */
interface CandidateTextBody {
  userId: string;
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

  const { userId, contents, errorMessage } = candidateTextBody;

  const resInsert = await db
    .insert(generatedText)
    .values({ userId, plantId, contents, errorMessage })
    .returning();

  // if (contents) {
  //   const plantDetails = JSON.parse(contents) as InsertPlant;
  //   const jsonBody: GenerateImageRequest = {
  //     description: plantDetails.description,
  //     plantId: plantDetails.id
  //   };

  //   const resImageRequest = await fetch("/api/images/generate", {
  //     method: "POST",
  //     body: JSON.stringify(jsonBody)
  //   });
  //   console.log(
  //     "result requesting new image generation:",
  //     resImageRequest.status,
  //     resImageRequest.statusText
  //   );
  //   return json({ resInsert, resImageRequest }, { status: 201 });
  // } else {
  //   throw Error("no plant details to use for image generation!");
  // }

  return json(resInsert, { status: 201 });
};

export const GET: RequestHandler = async ({ params }) => {
  const plantId = params["plantid"];
  const userId = params["userid"];

  if (plantId) {
    const matchingCandidatePlant = await db.query.generatedText.findFirst({
      where: eq(generatedText.plantId, plantId)
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
    const matchingCandidatePlant = await db.query.generatedText.findFirst({
      where: eq(generatedText.userId, userId)
    });

    if (matchingCandidatePlant) {
      return json(matchingCandidatePlant, { status: 200 });
    } else {
      console.log(
        "No matching candidate plant (text generation) for userID",
        userId,
        "... this is OK"
      );
      return json({}, { status: 202 });
    }
  } else {
    throw Error("either plantID or userID must be provided");
  }
};

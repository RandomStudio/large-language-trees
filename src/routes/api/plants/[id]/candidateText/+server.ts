import { db } from "$lib/server/db";
import { generatedText } from "$lib/server/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

/** Should be identical to the interface in
 * `/netlify/functions/text-gen-background.mts`
 */
interface CandidateTextBody {
  userId: string;
  contents?: string;
  errorMessage?: string;
}

export const POST: RequestHandler = async ({ params, request }) => {
  const plantId = params["id"];
  if (!plantId) {
    throw Error("plant ID param required");
  }

  const bodyJson = (await request.json()) as CandidateTextBody;

  const { userId, contents, errorMessage } = bodyJson;

  await db
    .insert(generatedText)
    .values({ userId, plantId, contents, errorMessage });

  return json({}, { status: 202 });
};

export const GET: RequestHandler = async ({ params }) => {
  const plantId = params["id"];
  if (!plantId) {
    throw Error("plant ID param required");
  }

  const matchingCandidatePlant = await db.query.generatedText.findFirst({
    where: eq(generatedText.plantId, plantId)
  });

  if (matchingCandidatePlant) {
    return json(matchingCandidatePlant, { status: 200 });
  } else {
    console.log(
      "No matching candidate plant (text generation) for",
      matchingCandidatePlant,
      "... this is OK"
    );
    return json({}, { status: 202 });
  }
};

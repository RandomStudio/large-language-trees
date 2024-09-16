import { json, type RequestHandler } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { getPromptSettings } from "$lib/server/promptSettings";
import { buildTextPrompt } from "$lib/promptUtils";
import { BACKGROUND_FN_SECRET } from "$env/static/private";
import type { GeneratePlantRequestBody, SelectPlant } from "$lib/types";
import { db } from "$lib/server/db";
import { eq, or } from "drizzle-orm";
import { generatedPlants, plants, users } from "$lib/server/schema";
import { publishEvent } from "$lib/server/realtime";
import type { EventPollinationStarting } from "$lib/events.types";

/** Should be identical to the version in
 * `/netlify/functions/complete-gen-background.mts`
 */
interface BackgroundGenerateTextRequest {
  authorTop: string;
  authorBottom: string;
  newPlantId: string;
  parent1Id: string;
  parent2Id: string;
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  backgroundSecret: string;
}

export const POST: RequestHandler = async ({ request, fetch }) => {
  const data = (await request.json()) as GeneratePlantRequestBody;

  const {
    prompt,
    thisUserId,
    thisPlantId,
    otherUserId,
    otherPlantId,
    userPickedNewName
  } = data;

  const plant1 = await db.query.plants.findFirst({
    where: eq(plants.id, thisPlantId)
  });
  const plant2 = await db.query.plants.findFirst({
    where: eq(plants.id, otherPlantId)
  });

  if (!plant1 || !plant2) {
    return json({}, { status: 400, statusText: "Parent plants not found" });
  }

  const newPlantId = uuidv4();

  const candidateEntries = await db
    .insert(generatedPlants)
    .values({
      plantId: newPlantId,
      authorTop: thisUserId,
      authorBottom: otherUserId,
      givenName: userPickedNewName,
      parentPlantTop: thisPlantId,
      parentPlantBottom: otherPlantId
    })
    .returning();

  const candidateEntry = candidateEntries[0];
  if (!candidateEntry) {
    throw Error("failed to insert new candidate entry");
  }

  // At this point, candidate has been created in DB, but
  // no content (text or images) has been generated yet...
  // Now initiate the generation process in the background...

  const promptSettings = await getPromptSettings();

  const messages =
    prompt ||
    buildTextPrompt(promptSettings, plant1, plant2, userPickedNewName);
  const model = data.model || promptSettings.text.model;

  const bodyJson: BackgroundGenerateTextRequest = {
    authorTop: thisUserId,
    authorBottom: otherUserId,
    newPlantId,
    parent1Id: plant1.id,
    parent2Id: plant2.id,
    model,
    messages: messages as {
      role: string;
      content: string;
    }[],
    backgroundSecret: BACKGROUND_FN_SECRET
  };

  console.log("sending body", bodyJson);

  const res = await fetch("/.netlify/functions/complete-gen-background", {
    method: "POST",
    body: JSON.stringify(bodyJson)
  });

  return json({ newPlantId }, { status: res.status });
};

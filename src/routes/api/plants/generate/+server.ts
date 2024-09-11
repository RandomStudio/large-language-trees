import { json, type RequestHandler } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { getPromptSettings } from "$lib/server/promptSettings";
import { buildTextPrompt } from "$lib/promptUtils";
import { BACKGROUND_FN_SECRET } from "$env/static/private";
import type { GeneratePlantRequestBody } from "$lib/types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { plants, users } from "$lib/server/schema";
import { stripUserInfo } from "$lib/security";

/** Should be identical to the version in
 * `/netlify/functions/text-gen-background.mts`
 */
interface BackgroundGenerateTextRequest {
  userId: string;
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

  const { prompt, thisUserId, thisPlantId, otherUserId, otherPlantId } = data;

  // First, check if this combination already exists
  // const thisUser = db.query.users.findFirst({ where: eq(users.id, thisUserId)});
  // if (!thisUserId) {
  //   throw Error("user not found");
  // }

  const thisUserSeedbankWithPlants = await db.query.users.findFirst({
    where: eq(users.id, thisUserId),
    with: {
      mySeedbank: { with: { plantsInSeedbank: { with: { plant: true } } } }
    }
  });

  if (!thisUserSeedbankWithPlants) {
    throw Error("failed to load user");
  }

  const alreadyExistingPlant =
    thisUserSeedbankWithPlants.mySeedbank.plantsInSeedbank.find(
      (p) => p.plant.parent1 === thisPlantId && p.plant.parent2 === otherPlantId
    );

  if (alreadyExistingPlant) {
    // Return 200 - OK (already exists!)
    return json(alreadyExistingPlant, { status: 200 });
  }

  const plant1 = await db.query.plants.findFirst({ where: eq(plants.id, thisPlantId)});
  const plant2 = await db.query.plants.findFirst({ where: eq(plants.id, otherPlantId)});

  if (!plant1 || !plant2) {
    throw Error("Failed to find existing plants (parents)");
  }

  const thisUser = stripUserInfo(thisUserSeedbankWithPlants);

  const promptSettings = await getPromptSettings();

  const messages = prompt || buildTextPrompt(promptSettings, plant1, plant2);
  const model = data.model || promptSettings.text.model;

  const newPlantId = uuidv4();

  const bodyJson: BackgroundGenerateTextRequest = {
    userId: thisUserId,,
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

  const res = await fetch("/.netlify/functions/text-gen-background", {
    method: "POST",
    body: JSON.stringify(bodyJson)
  });

  return json({ thisUser,  }, { status: res.status });
};

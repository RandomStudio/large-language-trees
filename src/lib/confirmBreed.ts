import { buildPrompt } from "./promptUtils";
import type { InsertPlant, SeedbankEntry, SelectPlant } from "./types";
import DefaultPromptConfig from "../defaults/prompt-config";
import { invalidateAll } from "$app/navigation";

export async function confirmBreed(
  parents: [SelectPlant, SelectPlant]
): Promise<InsertPlant> {
  console.log("confirmBreed...");
  const res = await fetch("/api/generate/plant", {
    method: "POST",
    body: JSON.stringify({
      prompt: buildPrompt(DefaultPromptConfig, parents[0], parents[1]),
      parents,
    }),
  });
  if (res.status === 200) {
    console.log("Created new candidate plant OK:", res);
    return (await res.json()) as InsertPlant;
  } else {
    const { status, statusText } = res;
    console.error("Error generating on backend:", { status, statusText });
    throw Error("Generate failure");
  }
}

export async function addNewPlant(
  candidateChild: InsertPlant,
  gardenId: string,
  seedbankId: string
) {
  console.log(
    "Inserting new plant with ID",
    candidateChild.id,
    "and image",
    candidateChild.imageUrl,
    "..."
  );
  const res = await fetch("/api/plants", {
    method: "POST",
    body: JSON.stringify(candidateChild),
  });
  const { status, statusText, body } = res;
  if (status === 201) {
    console.log("Sucessfully added!");

    // Also place in garden...
    const plantId = candidateChild.id;
    const rowIndex = 0;
    const colIndex = 0;
    const updated = {
      plantId,
      gardenId,
      rowIndex,
      colIndex,
    };
    const placementRes = await fetch("/api/plantsInGarden", {
      method: "POST",
      body: JSON.stringify(updated),
    });
    console.log("Placed in garden?", placementRes);

    // Also place in user seedbank...
    const entry: SeedbankEntry = {
      plantId,
      seedbankId,
    };
    const seedbankRes = await fetch("/api/plantsInSeedbank", {
      method: "POST",
      body: JSON.stringify(entry),
    });
    if (seedbankRes.status === 201) {
      console.log("successsfully added to Seedbank");
    }

    // Reload data for page
    console.log("Reloading page data...");
    await invalidateAll();

    console.log("...done");
  } else {
    console.error("failed to add plant");
  }
}

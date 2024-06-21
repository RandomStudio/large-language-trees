import { buildPrompt } from "./promptUtils";
import type { InsertPlant, SeedbankEntry, SelectPlant } from "./types";
import DefaultPromptConfig from "../defaults/prompt-config";
import { invalidateAll } from "$app/navigation";

export async function confirmBreed(
  parents: [SelectPlant, SelectPlant]
): Promise<InsertPlant> {
  console.log("confirmBreed...");
  const res = await fetch("/api/plants/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt: buildPrompt(DefaultPromptConfig, parents[0], parents[1]),
      parents
    })
  });
  console.log("Got response on /api/plants/generate", res);
  if (res.status === 200) {
    console.log("Created new candidate plant OK:", res);
    return (await res.json()) as InsertPlant;
  } else {
    const { status, statusText } = res;
    console.error("Error generating on backend:", { status, statusText });
    throw Error("Generate failure");
  }
}

export async function addConfirmedPlant(
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
    body: JSON.stringify(candidateChild)
  });
  const { status } = res;
  if (status === 201) {
    console.log("Sucessfully added!");

    await fetch("/api/plantsInGarden", {
      method: "POST",
      body: JSON.stringify({ plantId: candidateChild.id, gardenId })
    });

    await fetch("/api/plantsInSeedbank", {
      method: "POST",
      body: JSON.stringify({ plantId: candidateChild.id, seedbankId })
    });

    // Reload data for page
    console.log("Reloading page data...");
    await invalidateAll();

    console.log("...done");
  } else {
    console.error("failed to add plant");
  }
}

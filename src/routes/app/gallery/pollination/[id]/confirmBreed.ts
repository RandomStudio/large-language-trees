import { invalidateAll } from "$app/navigation";
import type {
  GeneratePlantRequestBody,
  InsertPlant,
  SelectCandidateText,
  SelectPlant
} from "$lib/types";

const checkCandidateTextReady = async (
  plantId: string
): Promise<InsertPlant | null> => {
  const exists = await fetch(`/api/plants/${plantId}/candidateText`);
  console.log("response status", exists.status);
  if (exists.status === 200) {
    const newPlant = (await exists.json()) as SelectCandidateText;
    const contents = newPlant.contents as string;
    return JSON.parse(contents) as InsertPlant;
  } else {
    return null;
  }
};

const awaitTimeout = async (t: number): Promise<void> =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, t);
  });

export async function confirmBreed(
  userId: string,
  parents: [SelectPlant, SelectPlant]
): Promise<InsertPlant> {
  const jsonBody: GeneratePlantRequestBody = {
    userId,
    parents
  };
  const res = await fetch("/api/plants/generate", {
    method: "POST",
    body: JSON.stringify(jsonBody)
  });

  const jsonResponse = (await res.json()) as {
    backgroundResponse: any;
    newPlantId: string;
  };

  const newPlantId = jsonResponse.newPlantId;

  let candidatePlant = null;

  while (candidatePlant === null) {
    await awaitTimeout(2000);
    console.log("Check for candidate text generation...");
    candidatePlant = await checkCandidateTextReady(newPlantId);
  }

  console.log("... got a candidate plant!", candidatePlant);
  return candidatePlant;
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
  const { authorTop, authorBottom } = candidateChild;
  console.log("Some (generated) plant details:", { authorTop, authorBottom });
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

export async function addConfirmedPlantToOtherUser(
  candidateChild: InsertPlant,
  otherUserId: string
) {
  console.log("addConfirmedPlantToOtherUser", { otherUserId });
  await fetch("/api/plantsInSeedbank", {
    method: "POST",
    body: JSON.stringify({ plantId: candidateChild.id, userId: otherUserId })
  });
}

import { SimpleEventNames, type EventNewSprouting } from "$lib/events.types";
import type { CandidatePlant, InsertPlant, SelectPlant } from "$lib/types";
import type { PostPlantToGardenBody } from "../../../api/plantsInGarden/+server";

export const addConfirmedPlant = async (
  candidateChild: InsertPlant
): Promise<SelectPlant> => {
  console.log("Inserting new plant", candidateChild);
  const res = await fetch("/api/plants", {
    method: "POST",
    body: JSON.stringify(candidateChild)
  });
  const { status } = res;
  if (status !== 201) {
    throw Error("failed to add plant");
  }
  const plant = (await res.json()) as SelectPlant;

  // Also, delete this "candidate plant"
  try {
    await fetch(`/api/plants/${candidateChild.id}/generatedPlant`, {
      method: "DELETE"
    });
  } catch (e) {
    console.error("Error deleting generated plant", e);
  }

  return plant;
};

/** Add a new plant to a User Garden */
export const addPlantToUser = async (
  insertPlant: InsertPlant,
  userId: string
) => {
  const gardenBody: PostPlantToGardenBody = {
    plantId: insertPlant.id,
    userId: userId
  };
  await fetch("/api/plantsInGarden", {
    method: "POST",
    body: JSON.stringify(gardenBody)
  });
};

export const insertNewPlant = async (plant: InsertPlant) => {
  const selectPlant = await addConfirmedPlant(plant);
  if (!plant.authorTop || !plant.authorBottom) {
    throw Error("plant missing authors");
  }

  await addPlantToUser(plant, plant.authorTop);
  await addPlantToUser(plant, plant.authorBottom);

  const event: EventNewSprouting = {
    name: SimpleEventNames.POLLINATION_COMPLETE,
    payload: selectPlant
  };
  const eventRes = await fetch("/api/events", {
    method: "POST",
    body: JSON.stringify(event)
  });
  console.log("event response:", eventRes.status, eventRes.statusText);
};

export const candidateToPlant = (candidate: CandidatePlant): InsertPlant => {
  const {
    plantId,
    authorTop,
    authorBottom,
    originalImageUrl,
    processedImageUrl,
    contents,
    parentTop,
    parentBottom
  } = candidate;

  console.log(candidate);
  const json = contents as InsertPlant;

  const { commonName, description, properties } = json;

  return {
    id: plantId,
    commonName,
    authorBottom,
    authorTop,
    imageUrl: processedImageUrl ?? originalImageUrl ?? "",
    description,
    properties,
    parent1: parentTop,
    parent2: parentBottom
  };
};

export const checkExistingCandidate = async (
  plantId: string
): Promise<CandidatePlant | null> => {
  const res = await fetch(`/api/plants/${plantId}/generatedPlant`);
  if (res.status === 404) {
    return null;
  }

  if (res.status === 200) {
    const p = (await res.json()) as CandidatePlant;
    return p;
  }

  return null;
};

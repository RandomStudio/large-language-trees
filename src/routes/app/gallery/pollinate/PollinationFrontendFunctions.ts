import type { EventNewSprouting } from "$lib/events.types";
import type { CandidatePlant, InsertPlant, SelectPlant } from "$lib/types";

const awaitTimeout = async (t: number): Promise<void> =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, t);
  });

export async function addConfirmedPlant(
  candidateChild: InsertPlant
): Promise<SelectPlant> {
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
  if (status !== 201) {
    throw Error("failed to add plant");
  }
  const plant = (await res.json()) as SelectPlant;
  return plant;
}

/** Add the new plant to both the seedbank AND garden of a given user */
export async function addPlantToUser(
  candidateChild: InsertPlant,
  userId: string
) {
  console.log("addConfirmedPlantToOtherUser", { otherUserId: userId });
  await fetch("/api/plantsInSeedbank", {
    method: "POST",
    body: JSON.stringify({ plantId: candidateChild.id, userId: userId })
  });
  await fetch("/api/plantsInGarden", {
    method: "POST",
    body: JSON.stringify({ plantId: candidateChild.id, userId: userId })
  });
}

export async function insertNewPlant(plant: InsertPlant) {
  const selectPlant = await addConfirmedPlant(plant);
  if (!plant.authorTop || !plant.authorBottom) {
    throw Error("plant missing authors");
  }

  await addPlantToUser(plant, plant.authorTop);
  await addPlantToUser(plant, plant.authorBottom);

  const event: EventNewSprouting = {
    name: "newPlantSprouted",
    payload: selectPlant
  };
  const eventRes = await fetch("/api/events", {
    method: "POST",
    body: JSON.stringify(event)
  });
  console.log("event response:", eventRes.status, eventRes.statusText);
}

export const candidateToPlant = async (
  plantId: string,
  authorTop: string,
  authorBottom: string
): Promise<InsertPlant> => {
  const exists = await fetch(`/api/plants/${plantId}/generatedPlant`);
  console.log("response status", exists.status);
  if (exists.status === 200) {
    let newPlant = (await exists.json()) as CandidatePlant;
    newPlant.authorBottom = authorBottom;
    newPlant.authorTop = authorTop;
    const contents = newPlant.contents as string;
    return JSON.parse(contents) as InsertPlant;
  } else {
    throw Error("cannot find candidate plant with id " + plantId);
  }
};

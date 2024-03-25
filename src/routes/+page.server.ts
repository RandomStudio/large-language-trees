import type { Plant } from "./types";

import type { Actions, PageServerLoad } from "./$types";
import { addNew, getAllPlants } from "$lib/server/router/plants";

export const load: PageServerLoad = async ({}) => {
  const seeds = await getAllPlants();
  return { seeds, newSeed: null };
};

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    const newSeed = data.get("newSeed") as string;
    if (newSeed) {
      console.log("Adding new seed:", newSeed, typeof newSeed);
      const plant = JSON.parse(newSeed) as Plant;
      await addNew(plant);
    }
  },
} satisfies Actions;

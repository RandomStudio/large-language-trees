import type { InsertPlant, SelectPlant } from "../../../types";

import type { Actions, PageServerLoad } from "./$types";
import { addNew, getAllPlants } from "$lib/server/server";

export const load: PageServerLoad = async ({ }) => {
  const seeds = await getAllPlants();
  return { seeds, newSeed: null };
};

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    const newSeed = data.get("newSeed") as string;
    const parentsString = data.get("parents") as string;
    console.log({ newSeed, parentsString });
    let parents: SelectPlant[] = [];
    if (parentsString) {
      parents = JSON.parse(parentsString) as SelectPlant[];
    }
    if (newSeed) {
      console.log("Adding new seed:", newSeed, typeof newSeed);
      const plant = JSON.parse(newSeed) as InsertPlant;
      await addNew(
        plant,
        parents.map((p) => p.id),
      );
    }
  },
} satisfies Actions;

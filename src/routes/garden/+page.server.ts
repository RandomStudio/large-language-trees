import type { PageServerLoad } from "./$types";
import { getAllPlants } from "$lib/server/server";

export const load: PageServerLoad = async ({}) => {
  console.log("******** (re)load page data");
  const seeds = await getAllPlants();
  return { seeds, newSeed: null };
};

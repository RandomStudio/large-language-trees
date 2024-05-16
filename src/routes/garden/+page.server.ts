import { getAllPlants } from "$lib/server/server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ }) => {
  const seeds = await getAllPlants();
  return { seeds, newSeed: null };
};

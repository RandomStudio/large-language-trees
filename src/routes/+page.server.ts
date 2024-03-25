import type { Plant } from "./types";
import DefaultSeeds from "../defaults/seeds.json";

import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { plantsTable } from "$lib/server/schema";

export const load: PageServerLoad = async ({}) => {
  const seeds = await db.query.plantsTable.findMany();
  if (seeds.length === 0) {
    console.log(
      "No plants in DB, we will attempt to populate with defaults...",
    );
    const plants: Plant[] = DefaultSeeds;
    plants.forEach(async (p) => {
      const { commonName, description, properties, imageUrl } = p;
      console.log("inserting", { commonName });
      await db
        .insert(plantsTable)
        .values({ commonName, description, properties, imageUrl });
    });
  }
  return { seeds, newSeed: null };
};

export const actions = {
  default: async ({ request, fetch }) => {
    // console.log("doing nothing, for now", request);
    const data = await request.formData();

    const newSeed = data.get("newSeed") as Plant | null;
    if (newSeed) {
      console.log("Adding new seed:", newSeed);
      const res = await fetch("/api", {
        method: "POST",
        body: JSON.stringify(newSeed),
      });
      console.log({ res });
    }
  },
} satisfies Actions;

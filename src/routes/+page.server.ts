import type { Plant } from "./types";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  console.log("page data loading!");
  const res = await fetch("/api");
  const seeds = await res.json();
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

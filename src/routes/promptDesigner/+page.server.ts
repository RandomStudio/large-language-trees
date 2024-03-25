import type { Plant } from "../../types";
import type { Actions, PageServerLoad } from "./$types";

export const actions = {
  default: async () => {
    console.log("form data will be processed by load function");
  },
} satisfies Actions;

export const load: PageServerLoad = async ({ request }) => {
  console.log("/create form submitted");
  const data = await request.formData();

  const parents = data.get("parents");

  if (parents) {
    const [parent1, parent2] = JSON.parse(parents as string) as [Plant, Plant];
    console.log("Generate form to mix parents", { parent1, parent2 });
    return {
      parents: [parent1, parent2],
      newSeed: null,
    };
  } else {
    return {
      parents: null,
      newSeed: null,
    };
  }
};

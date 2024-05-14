import {
  addNew,
  attachImageToPlant,
  getAllPlants,
  updateWholePlant,
} from "$lib/server/server";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { SelectPlant } from "../../../../types";

export const POST: RequestHandler = async ({ request }) => {
  const plant = await request.json();
  await addNew(plant, []);
  return new Response(plant);
};

export const PATCH: RequestHandler = async ({ request, params }) => {
  const plant = (await request.json()) as SelectPlant;
  console.log({ params, plant });
  if (plant.imageUrl) {
    await attachImageToPlant(plant.id, plant.imageUrl);
    return json(plant, { status: 200 });
  } else {
    await updateWholePlant(plant.id, plant);
    return json(plant, { status: 200 });
  }
};

// export const GET: RequestHandler = async ({ request, params }) => {
//   const id = params["id"];
//   if (id) {
//     const plant =

//   }
// }

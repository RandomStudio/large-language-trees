import { addNew, attachImageToPlant, getAllPlants } from "$lib/server/server";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { Plant } from "../../../../types";

export const POST: RequestHandler = async ({ request }) => {
  const plant = await request.json();
  await addNew(plant);
  return new Response(plant);
};

export const PATCH: RequestHandler = async ({ request, params }) => {
  const plant = (await request.json()) as Plant;
  console.log({ params, plant });
  if (plant.imageUrl) {
    await attachImageToPlant(plant.id, plant.imageUrl);
    return json(plant);
  } else {
    return json({});
  }
};

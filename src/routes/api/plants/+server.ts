import { addNew, getAllPlants } from "$lib/server/server";
import type { InsertPlant } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => json(await getAllPlants());

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as InsertPlant;
  await addNew(data);
  return json(data, { status: 201 });
};

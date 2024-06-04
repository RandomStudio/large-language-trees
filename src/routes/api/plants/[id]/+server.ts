import { db } from "$lib/server/db";
import { plants } from "$lib/server/schema";
import {
  addNew,
  attachImageToPlant,
  getAllPlants,
  updateWholePlant,
} from "$lib/server/server";
import type { SelectPlant } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ request }) => {
  const plant = await request.json();
  await addNew(plant);
  return new Response(plant);
};

export const PATCH: RequestHandler = async ({ request, params }) => {
  const plant = (await request.json()) as SelectPlant;
  console.log({ params, plant });
  await updateWholePlant(plant.id, plant);
  return json(plant, { status: 200 });
};

export const GET: RequestHandler = async ({ request, params }) => {
  const id = params["id"];
  if (id) {
    const plant = await db.query.plants.findFirst({ where: eq(plants.id, id) })
    if (plant) {
      return json(plant, { status: 200 });
    }
    else {
      throw Error("plant not found")
    }
  }
  else {
    throw Error("Param missing")
  }
}

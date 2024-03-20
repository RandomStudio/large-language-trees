import type { RequestHandler } from "./$types";

import type { Plant } from "../types";

import Seeds from "../../../db/seeds.json";
import { json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

let inMemory: Plant[] = [];

export const GET: RequestHandler = () => {
  if (inMemory.length == 0) {
    console.log("Server has no in-memory data; load from disk");
    const seeds = Seeds as Plant[];
    inMemory = seeds;
  }
  return json(inMemory);
};

export const DELETE: RequestHandler = () => {
  inMemory = [];
  return json(inMemory);
};

export const POST: RequestHandler = async ({ request }) => {
  const plant = JSON.parse(await request.json()) as Plant;
  console.log("add new plant", plant, typeof plant);
  inMemory = [...inMemory, plant];
  updateOnDisk();

  return json(inMemory);
};

export const PATCH: RequestHandler = async ({ request, params, url }) => {
  console.log("patch", { params, url });

  const newPlantJson = await request.json();

  const id = url.searchParams.get("id");
  if (id && newPlantJson) {
    console.log("update plant with ID", id, "...");
    inMemory.forEach((plant) => {
      if (plant.id === id) {
        console.log("updating", plant, "=>", newPlantJson);
        plant = newPlantJson;
      }
    });
  }

  updateOnDisk();
  return json(inMemory);
};

const updateOnDisk = async () => {
  const formatted = JSON.stringify(inMemory, null, 2);
  await fs.writeFile(
    path.resolve(process.cwd(), "db") + "/seeds.json",
    formatted,
  );
};

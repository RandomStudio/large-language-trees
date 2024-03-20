import type { RequestHandler } from "./$types";

import type { Plant } from "../types";

import Seeds from "../../defaults/seeds-with-descriptions.json";
import { json } from "@sveltejs/kit";

let inMemory: Plant[] = [];

export const GET: RequestHandler = () => {
  if (inMemory.length == 0) {
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
  return json(inMemory);
};

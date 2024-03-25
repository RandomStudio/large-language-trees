import { getAllPlants } from "$lib/server/server";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => json(await getAllPlants());

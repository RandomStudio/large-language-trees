import type { RequestHandler } from "./$types";

import type { Plant } from "../types";

import Seeds from "./seeds.json";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = () => {
  const seeds = Seeds as Plant[];
  return json(seeds);
};

export const POST: RequestHandler = ({ url, request }) => {
  return new Response();
};

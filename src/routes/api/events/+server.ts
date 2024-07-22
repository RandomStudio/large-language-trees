import { publishEvent } from "$lib/server/realtime";
import type { EventBody } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
  const event = (await request.json()) as EventBody;

  await publishEvent(event);

  return json({}, { status: 200 });
};

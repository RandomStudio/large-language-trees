import type { SimpleEventContents } from "$lib/events.types";
import { publishEvent } from "$lib/server/realtime";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
  const event = (await request.json()) as SimpleEventContents;

  console.log("relay event from /api/events", { event });

  await publishEvent(event);

  return json({}, { status: 200 });
};

import { handleDisplayNotification, publishEvent } from "$lib/server/realtime";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { DisplayNotifyServer } from "./types";

export const POST: RequestHandler = async ({ request }) => {
  const message = (await request.json()) as DisplayNotifyServer;

  console.log("relay message from display client", message);

  await handleDisplayNotification(message);

  return json({}, { status: 200 });
};

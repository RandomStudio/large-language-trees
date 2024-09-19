import { db } from "$lib/server/db";
import { presentationState } from "$lib/server/schema";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async () => {
  // TODO: for now, there is only one possible action, i.e. remove them all

  console.warn(
    "Deleting all presentation displays; they will need to be reloaded manually in the browser(s)"
  );
  await db.delete(presentationState);

  return json({}, { status: 200 });
};

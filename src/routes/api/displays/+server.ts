import { db } from "$lib/server/db";
import { presentationState } from "$lib/server/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { RefreshDisplays } from "./types";
import { publishDisplayRefresh } from "$lib/server/realtime";

export const POST: RequestHandler = async ({ request }) => {
  const req = (await request.json()) as RefreshDisplays;
  switch (req.action) {
    case "init": {
      console.warn(
        "Deleting all presentation displays; they will need to be reloaded manually in the browser(s)"
      );
      await db.delete(presentationState);
      // publishDisplayRefresh({ action: "reload"});

      return json(req, { status: 200 });
    }
    case "reload": {
      publishDisplayRefresh(req);
    }
    default: {
      return json(req, { status: 400 });
    }
  }
};

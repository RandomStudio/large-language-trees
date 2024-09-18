import { DisplayEventsNaming } from "$lib/events.types";
import {
  getAllScreens,
  getEventForAmbientDisplay,
  updateScreenStateAndPublish
} from "$lib/server/realtime";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ url }) => {
  const forceMode = url.searchParams.get("mode");
  console.log("/api/forceMode with param", { forceMode });

  type keyType = keyof typeof DisplayEventsNaming;

  if (forceMode) {
    console.log(forceMode, "=>", DisplayEventsNaming[forceMode as keyType]);
    const ambientMode = DisplayEventsNaming[forceMode as keyType];

    const data = await getEventForAmbientDisplay(ambientMode);
    const allScreens = await getAllScreens();
    allScreens.forEach(async (target) => {
      await updateScreenStateAndPublish(target.id, data, 1, 10000);
    });
    return json({ forceMode, data }, { status: 200 });
  } else {
    return json({ forceMode }, { status: 500 });
  }
};

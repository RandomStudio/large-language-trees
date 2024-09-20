import { DisplayEventNames } from "$lib/events.types";
import {
  getAllScreens,
  getEventForAmbientDisplay,
  updateScreenStateAndPublish
} from "$lib/server/realtime";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ url }) => {
  const forceMode = url.searchParams.get("mode");
  console.log("/api/forceMode with param", { forceMode });

  type keyType = keyof typeof DisplayEventNames;

  if (forceMode) {
    console.log(forceMode, "=>", DisplayEventNames[forceMode as keyType]);
    const ambientMode = DisplayEventNames[forceMode as keyType];

    const data = await getEventForAmbientDisplay(ambientMode, 30000);

    if (data !== null) {
      const allScreens = await getAllScreens();
      allScreens.forEach(async (target) => {
        await updateScreenStateAndPublish(data, target.id, 1);
      });
    }
    return json({ forceMode, data }, { status: 200 });
  } else {
    return json({ forceMode }, { status: 500 });
  }
};

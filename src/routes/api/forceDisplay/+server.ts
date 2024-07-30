import { bRollNaming } from "$lib/events.types";
import {
  getAllScreens,
  getDataForAmbientDisplay,
  updateScreenStateAndPublish
} from "$lib/server/realtime";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ url }) => {
  const forceMode = url.searchParams.get("mode");
  console.log("/api/forceMode with param", { forceMode });

  type ambientModeKey = keyof typeof bRollNaming;
  const keys = Object.keys(bRollNaming) as ambientModeKey[];

  if (forceMode) {
    if (Object.values(bRollNaming).find((x) => x === forceMode)) {
      const modeKey = keys.find((k) => bRollNaming[k] === forceMode);
      console.log(
        `Detected request for ambient mode "${forceMode}" == "${modeKey}"`
      );
      if (!modeKey) {
        throw Error("unknown mode key");
      }
      const data = await getDataForAmbientDisplay(modeKey);
      const allScreens = await getAllScreens();
      allScreens.forEach(async (target) => {
        await updateScreenStateAndPublish(target.id, data, 1, 10000);
      });
      return json({ forceMode, data }, { status: 200 });
    } else {
      console.log("TODO");
      return json({ forceMode }, { status: 200 });
    }
  } else {
    return json({}, { status: 500 });
  }
};

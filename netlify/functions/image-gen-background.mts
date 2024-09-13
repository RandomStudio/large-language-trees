// ----------------------------------------------------------------------------
// IMAGE-GEN REQUEST HANDLER
// Only used by admin/prompt utils for direct access

import { GenImageToBackground, initImageGeneration } from "./image-gen.mts";

// ----------------------------------------------------------------------------
export default async (req: Request) => {
  console.warn("Background Image Gen handler requested DIRECTLY");
  const requestBody = (await req.json()) as GenImageToBackground;

  // Set origin string used for requests to OUR server...
  const useLocalApi = process.env.BACKGROUND_FN_USES_LOCAL_API;
  const serverOrigin = useLocalApi || "https://livinggarden.netlify.app";

  await initImageGeneration(requestBody, serverOrigin);
};

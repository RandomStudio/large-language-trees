import type { DisplayEventContents } from "$lib/events.types";
import type { PageLoad } from "./$types";
import type { PresentationDisplayFrontendState } from "./types";

export const load: PageLoad = ({
  params,
  url
}): PresentationDisplayFrontendState => {
  const forceMode = url.searchParams.get("mode");
  return {
    id: params.id,
    contents: { name: "idle", contents: null },
    forceMode
  };
};

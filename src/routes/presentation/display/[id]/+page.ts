import { bRollNaming } from "$lib/events.types";
import type { PageLoad } from "./$types";
import type { PresentationDisplayFrontendState } from "./types";

export const load: PageLoad = ({
  params
}): PresentationDisplayFrontendState => {
  return {
    id: params.id,
    contents: { name: bRollNaming.IDLE, contents: null }
  };
};

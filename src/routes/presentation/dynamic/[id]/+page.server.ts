import { bRollNaming } from "$lib/events.types";
import type { PageServerLoad } from "./$types";
import type { PresentationDisplayFrontendState } from "./types";

export const load: PageServerLoad = ({
  params
}): PresentationDisplayFrontendState => {
  return {
    id: params.id,
    contents: { name: bRollNaming.IDLE, contents: null }
  };
};

import { IDLE_TIMEOUT } from "$lib/constants";
import { DisplayEventNames, type DisplayEvent } from "$lib/events.types";
import type { PageServerLoad } from "./$types";
import type { PresentationDisplayFrontendState } from "./types";

export const load: PageServerLoad = ({
  params
}): PresentationDisplayFrontendState => {
  const event: DisplayEvent = {
    name: DisplayEventNames.IDLE,
    payload: null,
    timeout: IDLE_TIMEOUT
  };
  return {
    id: params.id,
    event
  };
};

import type { PresentationDisplayState } from "$lib/types";

export interface PresentationDisplayFrontendState
  extends PresentationDisplayState {
  timeout: NodeJS.Timeout | null;
}

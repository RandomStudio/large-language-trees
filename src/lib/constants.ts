import { Duration } from "luxon";
import { DisplayEventNames } from "./events.types";

export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 30;
export const URL_PREFIX =
  "https://random-the-garden.s3.eu-north-1.amazonaws.com";
export const TOLERANCE_SIMPLE = 10;
export const HEIGHT_PROPERTY_KEY = "heightInMetres";

export const PLUG_NAMES = {
  simpleEvents: "events",
  eventLogs: "eventLogs",
  displayInstructions: "serverInstructDisplays",
  displayNotifications: "displayNotifyServer"
};

export const DURATION_TILL_FERTILE: Duration = Duration.fromObject({
  minutes: 5
});

export const DISPLAY_VIEW_WEIGHTINGS = new Map([
  [DisplayEventNames.DETAIL_MULTI, 4],
  [DisplayEventNames.DETAIL, 4],
  [DisplayEventNames.ZOOM_OUT, 1],
  [DisplayEventNames.ROLL_PAN, 1],
  [DisplayEventNames.STATISTICS_1, 1],
  [DisplayEventNames.STATISTICS_3, 1]
]);

/** How many gardens to display in "showMultipleGardens" / ROLL_PAN display */
export const NUM_GARDENS_MULTI = 5;

export const LIMIT_LEADERBOARD = 5;

/** The maximum number of latest event logs we need to fetch from the DB */
export const LIMIT_STATUS_FEED = 14;
/** The MINIMUM number of event log entries we need in order to switch to that display */
export const MIN_STATUS_FEED = 2;
/** How many entries to cap the table row count; delete where necessary to
 * maintain this limit.
 */
export const EVENT_LOG_MAX = 100;

/** How many plants (with their users) to show for "showMultipleFeaturedPlants" */
export const MULTIPLE_FEATURED_PLANTS_COUNT = 4;

/** The maximum number of characters for plantname and username */
export const LIMIT_CHARACTERS_USERNAME = 10;
export const LIMIT_CHARACTERS_PLANTNAME = 12;

// TIMEOUTS -------------------
export const IDLE_TIMEOUT = 2000;
export const BROLL_TIMEOUT = 10000;
export const MULTI_DETAIL_TIMEOUT = 15000;
export const NEW_USER_TIMEOUT = 8000;
export const POLLINATION_START_TIMEOUT = 8000;
export const POLLINATION_RESULT_TIMEOUT = 16000;
export const FADE_DURATION = 1500;

export const MAX_CANVASSES = 4;

export const LOADING_MESSAGES = [
  "Plants are being dug up",
  "The roots are intertwining",
  "DNA is being mixed up",
  "A new seed is created",
  "Watering the new plant",
  "Flowers are budding"
];

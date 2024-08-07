import { Duration } from "luxon";
import { bRollNaming } from "./events.types";

export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 30;
export const URL_PREFIX =
  "https://random-the-garden.s3.eu-north-1.amazonaws.com";
export const TOLERANCE_SIMPLE = 10;
export const HEIGHT_PROPERTY_KEY = "heightInMetres";

export const PLUG_NAMES = {
  simpleEvents: "events",
  displayInstructions: "serverInstructDisplays",
  displayNotifications: "displayNotifyServer"
};

export const DURATION_TILL_FERTILE: Duration = Duration.fromObject({
  minutes: 5
});

export const DISPLAY_VIEW_WEIGHTINGS = new Map([
  [bRollNaming.STATUS_FEED, 1],
  [bRollNaming.DETAIL, 4],
  [bRollNaming.ZOOM_OUT, 2],
  [bRollNaming.ROLL_PAN, 2],
  [bRollNaming.TOP_LIST, 1],
  [bRollNaming.STATISTICS_1, 2],
  [bRollNaming.STATISTICS_2, 1],
  [bRollNaming.STATISTICS_3, 1]
]);

/** How many gardens to display in "showMultipleGardens" / ROLL_PAN display */
export const NUM_GARDENS_MULTI = 5;

export const LIMIT_LEADERBOARD = 5;

/** The maximum number of latest event logs we need to fetch from the DB */
export const LIMIT_STATUS_FEED = 10;
/** The MINIMUM number of event log entries we need in order to switch to that display */
export const MIN_STATUS_FEED = 2;
/** How many entries to cap the table row count; delete where necessary to
 * maintain this limit.
 */
export const EVENT_LOG_MAX = 100;

/** How many plants (with their users) to show for "showMultipleFeaturedPlants" */
export const MULTIPLE_FEATURED_PLANTS_COUNT = 2;

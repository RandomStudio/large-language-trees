import type {
  GardenWithPlants,
  InsertPlant,
  PublicUserInfo,
  SelectPlant
} from "./types";

export interface SimpleEventBody {
  name: string;
  payload: any;
}

export interface EventNewUser extends SimpleEventBody {
  name: "newUser";
  payload: {
    userId: string;
    username: string;
  };
}

export interface EventFirstPlant extends SimpleEventBody {
  name: "newUserFirstPlant";
  payload: {
    plant: InsertPlant;
    user: PublicUserInfo;
  };
}

export interface EventNewPollination extends SimpleEventBody {
  name: "newPlantPollination";
  payload: InsertPlant;
}

export interface EventNewTopPlant extends SimpleEventBody {
  name: "newTopPollinator";
  payload: {
    plant: SelectPlant;
    user: PublicUserInfo;
  };
}

export type SimpleEvent =
  | EventNewUser
  | EventFirstPlant
  | EventNewPollination
  | EventNewTopPlant;

interface DisplayUpdateEvent {
  name: string;
  contents: any;
}

export interface DisplayFirstPlant extends DisplayUpdateEvent {
  name: "newUserFirstPlant";
  contents: {
    plant: InsertPlant;
    user: PublicUserInfo;
  };
}

export interface DisplayPollination extends DisplayUpdateEvent {
  name: "newPlantPollination";
  contents: {
    newPlant: InsertPlant;
    authorTop: PublicUserInfo;
    authorBottom: PublicUserInfo;
    plantTop: SelectPlant;
    plantBottom: SelectPlant;
  };
}

export interface FeedTextPart {
  text: string;
  highlight?: boolean;
}

export type FeedTextEntry = FeedTextPart[];

export enum bRollNaming {
  STATUS_FEED = "showStatusFeed",
  DETAIL = "showFeaturedPlant",
  ZOOM_OUT = "showFeaturedGarden",
  ROLL_PAN = "showMultipleGardens",
  TOP_LIST = "showLeaderboard",
  STATISTICS_1 = "showPlantGrowingTime",
  STATISTICS_2 = "showPlantCount",
  STATISTICS_3 = "showHighPollinator",
}

export interface DisplayStatusFeed extends DisplayUpdateEvent {
  name: bRollNaming.STATUS_FEED;
  contents: FeedTextEntry[];
}

export interface DisplayFeaturedPlant extends DisplayUpdateEvent {
  name: bRollNaming.DETAIL;
  contents: {
    plant: SelectPlant;
    user: PublicUserInfo;
  };
}

export interface DisplayFeaturedGarden extends DisplayUpdateEvent {
  name: bRollNaming.ZOOM_OUT;
  contents: {
    garden: GardenWithPlants;
    user: PublicUserInfo;
  };
}

export interface DisplayMultipleGardens extends DisplayUpdateEvent {
  name: bRollNaming.ROLL_PAN;
  contents: {
    garden: GardenWithPlants;
    user: PublicUserInfo;
  }[];
}

export interface DisplayLeaderboard extends DisplayUpdateEvent {
  name: bRollNaming.TOP_LIST;
  contents: {
    username: string;
    count: number;
  }[];
}

export interface DisplayPlantGrowingTime extends DisplayUpdateEvent {
  name: bRollNaming.STATISTICS_1;
  contents: { plant: SelectPlant; user: PublicUserInfo };
}

export interface DisplayPlantCount extends DisplayUpdateEvent {
  name: bRollNaming.STATISTICS_2;
  contents: {
    gardens: {
      garden: GardenWithPlants;
      user: PublicUserInfo;
    }[];
    count: number;
  };
}

export interface DisplayPlantCount extends DisplayUpdateEvent {
  name: bRollNaming.STATISTICS_3;
  contents: {
    plant: SelectPlant;
    user: PublicUserInfo;
  };
}

export interface DisplayIdle extends DisplayUpdateEvent {
  name: "idle";
  contents: null;
}

export type DisplayEventContents =
  | DisplayFirstPlant
  | DisplayPollination
  | DisplayStatusFeed
  | DisplayFeaturedPlant
  | DisplayFeaturedGarden
  | DisplayMultipleGardens
  | DisplayLeaderboard
  | DisplayPlantGrowingTime
  | DisplayPlantCount
  | DisplayIdle;

/** Interface for "serverInstructDisplays" messages.
 *
 * These messages are always published by the **server** and received
 * by the **display** clients.
 */
export interface DisplayUpdateMessage {
  /** Which display to target. Should be available in the topic (ID part)
   * anyway, but provided here for redundancy.
   */
  targetDisplayId: string;
  /** What content needs to be displayed, i.e. a `name` and `payload` */
  payload: DisplayEventContents;
  /** How long, in ms, before the display should notify the server that
   * it is ready for new content. If omitted, the content will stay
   * on that display until further instructions received.
   *
   * The content will **not** be immediately **removed** on this display after the
   * timeout is reached; instead, it is time for the display to notify the server
   * that it is available for new content.
   */
  timeout: number | null;
}

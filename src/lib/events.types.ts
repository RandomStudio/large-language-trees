import type {
  CandidatePlant,
  GardenWithPlants,
  PublicUserInfo,
  SelectPlant
} from "./types";

/** "Simple" Events are used internally, never for directly controlling Presentation Display content.
 * They often, in turn, result in a new DisplayUpdateEvent message, however.
 */
export interface SimpleEvent {
  name: SimpleEventNames;
  payload: any;
}

export const enum SimpleEventNames {
  NEW_USER = "newUser",
  FIRST_PLANT = "newUserFirstPlant",
  POLLINATION_STARTING = "newPollinationStarting",
  CANDIDATE_READY = "newGeneratedPlantReady",
  POLLINATION_COMPLETE = "newPlantSprouted"
}
export interface EventNewUser extends SimpleEvent {
  name: SimpleEventNames.NEW_USER;
  payload: {
    userId: string;
    username: string;
  };
}

export interface EventFirstPlant extends SimpleEvent {
  name: SimpleEventNames.FIRST_PLANT;
  payload: {
    plant: SelectPlant;
    user: PublicUserInfo;
  };
}

// TODO: this is currently unused, but probably is needed somewhere
// export interface EventNewTopPlant extends SimpleEventBody {
//   name: "newTopPollinator";
//   payload: {
//     plant: SelectPlant;
//     user: PublicUserInfo;
//   };
// }

/** 1: We don't even have a name yet */
export interface EventPollinationStarting extends SimpleEvent {
  name: SimpleEventNames.POLLINATION_STARTING;
  payload: {
    plantTop: SelectPlant;
    plantBottom: SelectPlant;
    authorTop: PublicUserInfo;
    authorBottom: PublicUserInfo;
  };
}
/** 2: Generation is complete, but:
 * - image may need to be processed (palette, transparency)
 * - may not have been added yet (to plants list, gardens/seedbanks)
 */
export interface EventGeneratedPlantReady extends SimpleEvent {
  name: SimpleEventNames.CANDIDATE_READY;
  payload: CandidatePlant;
}

/**
 * 3: Plant that was generated has been added to plant list and
 * both users' gardens/seedbanks
 */
export interface EventNewSprouting extends SimpleEvent {
  name: SimpleEventNames.POLLINATION_COMPLETE;
  payload: SelectPlant;
}

/** Interface for "serverInstructDisplays" messages.
 *
 * These messages are always published by the **server** and received
 * by the **display** clients.
 */
export interface DisplayEvent {
  name: DisplayEventNames;
  /** What content needs to be displayed */
  payload: any;
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

export enum DisplayEventNames {
  IDLE = "idle",
  STATUS_FEED = "showStatusFeed",
  DETAIL = "showFeaturedPlant",
  DETAIL_MULTI = "showMultipleFeaturedPlants",
  ZOOM_OUT = "showFeaturedGarden",
  ROLL_PAN = "showMultipleGardens",
  STATISTICS_1 = "showPlantGrowingTime",
  STATISTICS_2 = "showPlantCount",
  STATISTICS_3 = "showPlantPollinationCount",
  ANNOUNCE_FIRST_PLANT = "newUserFirstPlant",
  ANNOUNCE_POLLINATION_STARTING = "newPollinationStarting",
  ANNOUNCE_NEW_SPROUT = "newPlantSprouted"
}

export interface DisplayFirstPlant extends DisplayEvent {
  name: DisplayEventNames.ANNOUNCE_FIRST_PLANT;
  payload: {
    plant: SelectPlant;
    user: PublicUserInfo;
  };
}

export interface DisplayPollinationStarting extends DisplayEvent {
  name: DisplayEventNames.ANNOUNCE_POLLINATION_STARTING;
  payload: {
    authorTop: PublicUserInfo;
    authorBottom: PublicUserInfo;
    plantTop: SelectPlant;
    plantBottom: SelectPlant;
  };
}

export interface DisplayNewPollinatedSprout extends DisplayEvent {
  name: DisplayEventNames.ANNOUNCE_NEW_SPROUT;
  payload: {
    newPlant: SelectPlant;
    authorTop: PublicUserInfo;
    authorBottom: PublicUserInfo;
  };
}

export interface FeedTextPart {
  text: string;
  highlight?: boolean;
}

export type FeedTextEntry = FeedTextPart[];

export interface DisplayStatusFeed extends DisplayEvent {
  name: DisplayEventNames.STATUS_FEED;
  payload: { gardens: GardenWithPlants[]; eventLogs: FeedTextEntry[] };
}

export interface DisplayFeaturedPlant extends DisplayEvent {
  name: DisplayEventNames.DETAIL;
  payload: {
    plant: SelectPlant;
    user: PublicUserInfo;
  };
}

export interface DisplayMultipleFeaturedPlants extends DisplayEvent {
  name: DisplayEventNames.DETAIL_MULTI;
  payload: {
    plant: SelectPlant;
    user: PublicUserInfo;
  }[];
}

export interface DisplayFeaturedGarden extends DisplayEvent {
  name: DisplayEventNames.ZOOM_OUT;
  payload: {
    garden: GardenWithPlants;
    user: PublicUserInfo;
  };
}

export interface DisplayMultipleGardens extends DisplayEvent {
  name: DisplayEventNames.ROLL_PAN;
  payload: GardenWithPlants[];
}

export interface DisplayPlantGrowingTime extends DisplayEvent {
  name: DisplayEventNames.STATISTICS_1;
  payload: {
    plant: SelectPlant;
    user: PublicUserInfo;
    pollinationTimestamp: Date;
  };
}

export interface DisplayPlantCount extends DisplayEvent {
  name: DisplayEventNames.STATISTICS_2;
  payload: {
    gardens: {
      garden: GardenWithPlants;
      user: PublicUserInfo;
    }[];
    count: number;
  };
}

export interface DisplayPlantPollinationStats extends DisplayEvent {
  name: DisplayEventNames.STATISTICS_3;
  payload: {
    plant: SelectPlant;
    pollinationCount: number;
    user: PublicUserInfo;
  };
}
export interface DisplayIdle extends DisplayEvent {
  name: DisplayEventNames.IDLE;
  payload: null;
}

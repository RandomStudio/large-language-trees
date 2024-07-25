import type { InsertPlant, PublicUserInfo } from "./types";

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

export type SimpleEvent = EventNewUser | EventFirstPlant | EventNewPollination;

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
    plant: InsertPlant;
    authorTop: PublicUserInfo;
    authorBottom: PublicUserInfo;
  };
}

export interface DisplayIdle extends DisplayUpdateEvent {
  name: "idle";
  contents: null;
}

export type DisplayEventContents =
  | DisplayFirstPlant
  | DisplayPollination
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

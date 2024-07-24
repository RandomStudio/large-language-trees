import type { InsertPlant } from "./types";

export interface EventBody {
  name: string;
  payload: any;
}

export interface EventNewUser extends EventBody {
  name: "newUser";
  payload: {
    userId: string;
    username: string;
  };
}

export interface EventFirstPlant extends EventBody {
  name: "newUserFirstPlant";
  payload: InsertPlant;
}

export interface EventNewPollination extends EventBody {
  name: "newPlantPollination";
  payload: InsertPlant;
}

export interface IdleEvent extends EventBody {
  name: "idle";
  payload: null;
}

export type EventType =
  | EventNewUser
  | EventFirstPlant
  | EventNewPollination
  | IdleEvent;

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
  contents: EventType;
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

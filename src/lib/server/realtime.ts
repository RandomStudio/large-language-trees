import { BROKER_DEFAULTS, encode, OutputPlug, TetherAgent } from "tether-agent";
import { db } from "./db";
import { gardens, plants, presentationState, seedbanks, users } from "./schema";
import { eq, not } from "drizzle-orm";
import {
  bRollNaming,
  type DisplayEventContents,
  type DisplayFeaturedGarden,
  type DisplayFeaturedPlant,
  type DisplayFirstPlant,
  type DisplayIdle,
  type DisplayLeaderboard,
  type DisplayMultipleGardens,
  type DisplayPollination,
  type DisplayStatusFeed,
  type DisplayUpdateMessage,
  type SimpleEvent
} from "$lib/events.types";
import { pickRandomElement } from "random-elements";
import type { DisplayNotifyServer } from "../../routes/api/displayNotifyServer/types";
import { stripUserInfo } from "$lib/security";

export const publishEvent = async (event: SimpleEvent) => {
  const agent = await TetherAgent.create("server", {
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: "50e2193c64234fd18838db7ad6711592.s1.eu.hivemq.cloud",
      port: 8883,
      protocol: "mqtts"
    }
  });

  const plug = new OutputPlug(agent, "events", { publishOptions: { qos: 2 } });

  const { name, payload } = event;
  console.log("Publishing event", { name, payload }, "...");

  await plug.publish(encode({ name, payload }));

  await agent.disconnect();

  await updatePresentationDisplaysOnEvent(event);
};

const publishDisplayInstructions = async (
  targetDisplayId: string,
  contents: DisplayEventContents,
  timeout: number | null
) => {
  const agent = await TetherAgent.create("server", {
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: "50e2193c64234fd18838db7ad6711592.s1.eu.hivemq.cloud",
      port: 8883,
      protocol: "mqtts"
    }
  });

  const plug = new OutputPlug(agent, "serverInstructDisplays", {
    id: targetDisplayId,
    publishOptions: { qos: 2 }
  });

  console.log("Publishing screen content update", { contents, timeout }, "...");

  const message: DisplayUpdateMessage = {
    targetDisplayId,
    payload: contents,
    timeout
  };

  await plug.publish(encode(message));

  await agent.disconnect();
};

export const handleDisplayNotification = async (
  message: DisplayNotifyServer
) => {
  const { displayId, event } = message;

  if (event === "init") {
    console.log("A display came online (or reloaded)");
    const exists = await db.query.presentationState.findFirst({
      where: eq(presentationState.id, displayId)
    });
    if (!exists) {
      // We didn't know about this display before; add with some
      // defaults
      await db.insert(presentationState).values({
        id: displayId,
        contents: null,
        priority: null
      });

      // Add an idle state with a short timeout, so that the new
      // display will be assigned a "B-roll" state soon...
      const idleState: DisplayIdle = {
        name: "idle",
        contents: null
      };
      await updateScreenStateAndPublish(displayId, idleState, null, 2000);
    }
  }

  if (event === "timeout") {
    console.log(
      "A display timed out its current animation, pick something new"
    );
    type keyType = keyof typeof bRollNaming;
    const keys = Object.keys(bRollNaming) as keyType[];

    const pickDisplayType = pickRandomElement(keys);

    try {
      const contents = await randomAmbientDisplay(pickDisplayType);

      await publishDisplayInstructions(displayId, contents, 15000);
    } catch (e) {
      console.error(
        "Something went wrong getting a random Display layout: " + e
      );
    }
  }
};

const randomAmbientDisplay = async (
  pickDisplayType: keyof typeof bRollNaming
): Promise<DisplayEventContents> => {
  switch (pickDisplayType) {
    case "DETAIL": {
      const allNormalUsers = await db.query.users.findMany({
        where: eq(users.isAdmin, false),
        with: { myGarden: true }
      });
      if (allNormalUsers.length == 0) {
        throw Error("no users to choose from!");
      }
      const pickRandomUser = pickRandomElement(allNormalUsers);

      const userGarden = pickRandomUser.myGarden;
      const plantsInGarden = await db.query.gardens.findMany({
        where: eq(gardens.id, userGarden.id),
        with: { plantsInGarden: true }
      });
      if (plantsInGarden.length === 0) {
        throw Error("no plants in user garden!");
      }
      const pickRandomPlant = pickRandomElement(plantsInGarden);
      const thePlant = await db.query.plants.findFirst({
        where: eq(plants.id, pickRandomPlant.id)
      });

      if (thePlant === undefined) {
        throw Error("failed to find plant " + pickRandomPlant.id);
      }
      const contents: DisplayFeaturedPlant = {
        name: bRollNaming.DETAIL,
        contents: {
          user: stripUserInfo(pickRandomUser),
          plant: thePlant
        }
      };
      return contents;
    }
    case "STATUS_FEED": {
      // TODO: build up a list of recent events. Do we need to write these to a table,
      // perhaps based on incoming SimpleEvents?
      const contents: DisplayStatusFeed = {
        name: bRollNaming.STATUS_FEED,
        contents: [
          [
            {
              text: "Testing..."
            },
            {
              text: "Highlighted text!",
              highlight: true
            },
            {
              text: "...and more."
            }
          ]
        ]
      };
      return contents;
    }
    case "ROLL_PAN": {
      // TODO: exclude admin gardens
      const allGardens = await db.select().from(gardens);
      const pickGarden = pickRandomElement(allGardens);
      const theUser = await db
        .select()
        .from(users)
        .where(eq(users.id, pickGarden.userId));

      const contents: DisplayMultipleGardens = {
        name: bRollNaming.ROLL_PAN,
        contents: []
      };
      return contents;
    }
    default: {
      throw Error("unknown pickDisplayType");
    }
  }
};

export const updatePresentationDisplaysOnEvent = async (
  latestEvent: SimpleEvent
) => {
  switch (latestEvent.name) {
    case "newUser": {
      // Ignore new user events for now
      break;
    }
    case "newUserFirstPlant": {
      const PRIORITY = 1;
      const TIMEOUT = 5000;
      const targetScreen = await findScreenFor(PRIORITY);
      if (targetScreen) {
        const { user, plant } = latestEvent.payload;
        const e: DisplayFirstPlant = {
          name: "newUserFirstPlant",
          contents: {
            plant,
            user
          }
        };
        await updateScreenStateAndPublish(targetScreen, e, PRIORITY, TIMEOUT);
      }
      break;
    }
    case "newPlantPollination": {
      const PRIORITY = 1;
      const TIMEOUT = 8000;
      const targetScreen = await findScreenFor(PRIORITY);
      if (targetScreen) {
        const plant = latestEvent.payload;
        if (plant.authorTop && plant.authorBottom) {
          const authorTop = await db.query.users.findFirst({
            where: eq(users.id, plant.authorTop)
          });
          const authorBottom = await db.query.users.findFirst({
            where: eq(users.id, plant.authorBottom)
          });
          if (authorTop && authorBottom) {
            const e: DisplayPollination = {
              name: "newPlantPollination",
              contents: {
                plant,
                authorTop: stripUserInfo(authorTop),
                authorBottom: stripUserInfo(authorBottom)
              }
            };
            await updateScreenStateAndPublish(
              targetScreen,
              e,
              PRIORITY,
              TIMEOUT
            );
          } else {
            console.error(
              "author(s) not found in DB:",
              plant.authorTop,
              plant.authorBottom
            );
          }
        } else {
          console.error("author(s) missing from", { plant });
        }
      }
      break;
    }
    default: {
      console.error("Unknown event type!", latestEvent);
    }
  }
};

/** Find a screen that is available to display a view with a given priority level.
 * In the case where no suitable screens are available, return null.
 */
const findScreenFor = async (priority: number): Promise<string | null> => {
  // Ordered by last updated ASC, i.e. oldest (last-updated) screen first
  const screens = await db
    .select({ id: presentationState.id, priority: presentationState.priority })
    .from(presentationState);

  const availableScreens = screens.filter((s) =>
    s.priority === null ? true : s.priority < priority
  );

  if (availableScreens.length === 0) {
    console.warn("All screens occupied with same or higher priority");
  }

  return availableScreens.length > 0
    ? pickRandomElement(availableScreens).id
    : null;
};

/** Publish updates on channel, persist to database */
const updateScreenStateAndPublish = async (
  targetId: string,
  contents: DisplayEventContents,
  priority: number | null,
  timeout: number | null
) => {
  await db
    .update(presentationState)
    .set({ contents, priority })
    .where(eq(presentationState.id, targetId));
  await publishDisplayInstructions(targetId, contents, timeout);
};

import { BROKER_DEFAULTS, encode, OutputPlug, TetherAgent } from "tether-agent";
import { v4 as uuidv4 } from "uuid";

import { db } from "./db";
import {
  eventLogs,
  gardens,
  plants,
  presentationState,
  seedbanks,
  users
} from "./schema";
import { count, desc, eq, not } from "drizzle-orm";
import {
  bRollNaming,
  type DisplayEventContents,
  type DisplayFeaturedGarden,
  type DisplayFeaturedPlant,
  type DisplayFirstPlant,
  type DisplayIdle,
  type DisplayLeaderboard,
  type DisplayMultipleGardens,
  type DisplayPlantCount,
  type DisplayPlantGrowingTime,
  type DisplayPollination,
  type DisplayStatusFeed,
  type DisplayUpdateMessage,
  type FeedTextEntry,
  type SimpleEvent
} from "$lib/events.types";
import { pickMultipleRandomElements, pickRandomElement } from "random-elements";
import type { DisplayNotifyServer } from "../../routes/api/displayNotifyServer/types";
import { stripUserInfo } from "$lib/security";
import {
  LIMIT_LEADERBOARD,
  LIMIT_STATUS_FEED,
  MIN_STATUS_FEED,
  NUM_GARDENS_MULTI
} from "../../defaults/presentation";
import { PLUG_NAMES } from "../../defaults/constants";

export const publishEvent = async (event: SimpleEvent) => {
  const agent = await TetherAgent.create("server", {
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: "50e2193c64234fd18838db7ad6711592.s1.eu.hivemq.cloud",
      port: 8883,
      protocol: "mqtts"
    }
  });

  const plug = new OutputPlug(agent, PLUG_NAMES.simpleEvents, {
    publishOptions: { qos: 2 }
  });

  const { name, payload } = event;
  console.log("Publishing event", { name, payload }, "...");

  await plug.publish(encode({ name, payload }));

  await agent.disconnect();

  await logSimpleEvents(event);

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

  const plug = new OutputPlug(agent, PLUG_NAMES.displayInstructions, {
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

  const idleState: DisplayIdle = {
    name: "idle",
    contents: null
  };

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
    }
    // Add an idle state with a short timeout, so that the new
    // display will be assigned a "B-roll" state soon...
    await updateScreenStateAndPublish(displayId, idleState, null, 2000);
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

      await updateScreenStateAndPublish(displayId, contents, 0, 15000);
    } catch (e) {
      console.error(
        "Something went wrong getting a random Display layout: " + e
      );
      await updateScreenStateAndPublish(displayId, idleState, null, 2000);
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
      const latestEvents = await db
        .select()
        .from(eventLogs)
        .orderBy(desc(eventLogs.timestamp))
        .limit(LIMIT_STATUS_FEED);
      if (latestEvents.length < MIN_STATUS_FEED) {
        throw Error(
          `Not enough event logs (${latestEvents.length} < ${MIN_STATUS_FEED}) to show this view`
        );
      }
      const contents: DisplayStatusFeed = {
        name: bRollNaming.STATUS_FEED,
        contents: latestEvents.map((entry) => entry.contents as FeedTextEntry)
      };
      return contents;
    }
    case "ROLL_PAN": {
      // TODO: exclude admin gardens
      const allGardens = await db.query.gardens.findMany({
        with: { myOwner: true, plantsInGarden: { with: { plant: true } } }
      });
      if (allGardens.length < 5) {
        throw Error("Not enough gardens to display count=" + NUM_GARDENS_MULTI);
      }
      const pickGardens = pickMultipleRandomElements(
        allGardens,
        NUM_GARDENS_MULTI
      );

      const contents: DisplayMultipleGardens = {
        name: bRollNaming.ROLL_PAN,
        contents: pickGardens.map((garden) => ({
          garden,
          user: stripUserInfo(garden.myOwner)
        }))
      };
      return contents;
    }
    case "ZOOM_OUT": {
      const allGardens = await db.query.gardens.findMany({
        with: { myOwner: true, plantsInGarden: true }
      });
      const pickGarden = pickRandomElement(allGardens);
      const plantsInGarden = await db.query.gardensToPlants.findMany({
        with: { plant: true }
      });
      const contents: DisplayFeaturedGarden = {
        name: bRollNaming.ZOOM_OUT,
        contents: {
          garden: {
            ...pickGarden,
            plantsInGarden
          },
          user: stripUserInfo(pickGarden.myOwner)
        }
      };
      return contents;
    }
    case "TOP_LIST": {
      // TODO: This is probably not a slow query, but certainly a very big payload,
      // potentially: it is ALL gardens with ALL plant details for EVERY plant in
      // each garden, plus all user details.
      // An orderBy + LIMIT would probably help, but this would require a join.
      const allGardens = await db.query.gardens.findMany({
        with: { myOwner: true, plantsInGarden: true }
      });

      if (allGardens.length < LIMIT_LEADERBOARD) {
        throw Error("Not enough gardens for leaderboard");
      }

      const orderedByPlantCount = allGardens
        .filter((g) => g.myOwner.isAdmin === false)
        .sort((a, b) => {
          return b.plantsInGarden.length - a.plantsInGarden.length;
        })
        .slice(0, LIMIT_LEADERBOARD);

      const contents: DisplayLeaderboard = {
        name: bRollNaming.TOP_LIST,
        contents: orderedByPlantCount.map((garden) => ({
          username: garden.myOwner.username,
          count: garden.plantsInGarden.length
        }))
      };
      return contents;
    }
    case "STATISTICS_1": {
      const allGardens = await db
        .select({ id: gardens.id, userId: gardens.userId })
        .from(gardens);
      const pickGarden = pickRandomElement(allGardens);
      const gardenWithPlants = await db.query.gardens.findFirst({
        where: eq(gardens.id, pickGarden.id),
        with: { plantsInGarden: true }
      });
      if (gardenWithPlants) {
        const { plantsInGarden } = gardenWithPlants;
        const pickPlant = pickRandomElement(plantsInGarden);
        const plantInfo = await db.query.plants.findFirst({
          where: eq(plants.id, pickPlant.plantId)
        });
        const user = await db.query.users.findFirst({
          where: eq(users.id, pickGarden.userId)
        });
        if (user && plantInfo) {
          const contents: DisplayPlantGrowingTime = {
            name: bRollNaming.STATISTICS_1,
            contents: {
              plant: plantInfo,
              user: stripUserInfo(user)
            }
          };
          return contents;
        } else {
          throw Error("user/plantInfo undefined");
        }
      } else {
        throw Error("gardenWithPlants undefined");
      }
      // const user = await db.select().from(users).where(eq(users.id, pickPlant.authorTop))
    }
    case "STATISTICS_2": {
      const [result] = await db.select({ count: count() }).from(plants);
      const allGardens = await db.query.gardens.findMany({
        with: {
          plantsInGarden: { with: { plant: true } },
          myOwner: true
        }
      });

      const pickGardens = pickMultipleRandomElements(
        allGardens,
        NUM_GARDENS_MULTI
      );

      const contents: DisplayPlantCount = {
        name: bRollNaming.STATISTICS_2,
        contents: {
          gardens: pickGardens.map((garden) => ({
            garden,
            user: stripUserInfo(garden.myOwner)
          })),
          count: result.count
        }
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
          if (!authorTop || !authorBottom) {
            throw Error("where are the author users?");
          }
          if (!plant.parent1 || !plant.parent2) {
            throw Error("where are the parent plants?");
          }
          const plantTop = await db.query.plants.findFirst({
            where: eq(plants.id, plant.parent1)
          });
          const plantBottom = await db.query.plants.findFirst({
            where: eq(plants.id, plant.parent2)
          });
          if (authorTop && authorBottom && plantTop && plantBottom) {
            const e: DisplayPollination = {
              name: "newPlantPollination",
              contents: {
                newPlant: plant,
                authorTop: stripUserInfo(authorTop),
                authorBottom: stripUserInfo(authorBottom),
                plantTop,
                plantBottom
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
  console.log(
    "updateScreenStateAndPublish:",
    { targetId, name: contents.name, priority, timeout },
    "..."
  );
  await db
    .update(presentationState)
    .set({ contents, priority })
    .where(eq(presentationState.id, targetId));
  await publishDisplayInstructions(targetId, contents, timeout);
};

/** Because of our serverless architecture, we cannot listen using TCP
 * socket "constantly" to incoming events on the server side. Therefore,
 * we append logs to a DB table in order to have a persistent list
 * we can read from when required (e.g. for "status feed").
 *
 * TODO: Some basic log management is possible here; if the table has more than EVENT_LOG_MAX
 * entries, we should delete older entries.
 */
export const logSimpleEvents = async (event: SimpleEvent) => {
  const contents = await eventToLog(event);
  await db.insert(eventLogs).values({ id: uuidv4(), contents });
};

const eventToLog = async (event: SimpleEvent): Promise<FeedTextEntry> => {
  switch (event.name) {
    case "newUser": {
      return [
        {
          text: event.payload.username,
          highlight: true
        },
        {
          text: "just joined"
        }
      ];
    }
    case "newUserFirstPlant": {
      return [
        {
          text: `${event.payload.user.username}'s ${event.payload.plant.commonName}`,
          highlight: true
        },
        {
          text: "just sprouted in the Garden"
        }
      ];
    }
    case "newPlantPollination": {
      const { parent1, parent2 } = event.payload;
      if (!parent1 || !parent2) {
        throw Error("");
      }
      const plantTop = await db.query.plants.findFirst({
        where: eq(plants.id, parent1)
      });
      const plantBottom = await db.query.plants.findFirst({
        where: eq(plants.id, parent2)
      });
      return [
        {
          text: `${event.payload.authorTop}'s ${plantTop?.commonName}`,
          highlight: true
        },
        {
          text: "just pollinated"
        },
        {
          text: `${event.payload.authorBottom}'s ${plantBottom?.commonName}`
        }
      ];
    }
    case "newTopPollinator": {
      return [
        {
          text: `${event.payload.user.username}'s ${event.payload.plant.commonName}`,
          highlight: true
        },
        {
          text: "just became top pollinator"
        }
      ];
    }
  }
};

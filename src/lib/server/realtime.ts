import { BROKER_DEFAULTS, encode, OutputPlug, TetherAgent } from "tether-agent";
import { v4 as uuidv4 } from "uuid";

import { db } from "./db";
import {
  eventLogs,
  gardens,
  gardensToPlants,
  plants,
  presentationState,
  seedbanksToPlants,
  users
} from "./schema";
import { count, desc, eq, isNotNull, or } from "drizzle-orm";
import {
  bRollNaming,
  type DisplayEventContents,
  type DisplayFeaturedGarden,
  type DisplayFeaturedPlant,
  type DisplayFirstPlant,
  type DisplayIdle,
  type DisplayLeaderboard,
  type DisplayMultipleFeaturedPlants,
  type DisplayMultipleGardens,
  type DisplayPlantCount,
  type DisplayPlantGrowingTime,
  type DisplayPlantPollinationStats,
  type DisplayPollination,
  type DisplayStatusFeed,
  type DisplayUpdateMessage,
  type FeedTextEntry,
  type SimpleEvent
} from "$lib/events.types";
import {
  pickKeysWithWeights,
  pickMultipleRandomElements,
  pickRandomElement
} from "random-elements";
import type { DisplayNotifyServer } from "../../routes/api/displayNotifyServer/types";
import { stripUserInfo } from "$lib/security";
import {
  BROLL_TIMEOUT,
  DISPLAY_VIEW_WEIGHTINGS,
  LIMIT_LEADERBOARD,
  LIMIT_STATUS_FEED,
  MIN_STATUS_FEED,
  MULTIPLE_FEATURED_PLANTS_COUNT,
  NEW_PLANT_TIMEOUT,
  NEW_USER_TIMEOUT,
  NUM_GARDENS_MULTI,
  PLUG_NAMES
} from "$lib/constants";
import { PUBLIC_TETHER_HOST } from "$env/static/public";

export const publishEvent = async (event: SimpleEvent) => {
  const useLocal = PUBLIC_TETHER_HOST === "localhost";

  const agent = await TetherAgent.create("server", {
    loglevel: "warn",
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      ...BROKER_DEFAULTS.nodeJS,
      host: PUBLIC_TETHER_HOST,
      port: useLocal ? 1883 : 8883,
      protocol: useLocal ? "mqtt" : "mqtts"
    }
  });

  const plug = new OutputPlug(agent, PLUG_NAMES.simpleEvents, {
    id: event.name,
    publishOptions: { qos: 2 }
  });

  const { name, payload } = event;
  console.log("Publishing event", { name, payload }, "...");

  await plug.publish(encode({ name, payload }));

  await agent.disconnect();

  await logSimpleEvents(event);

  await showMainEvent(event);
};

const publishDisplayInstructions = async (
  targetDisplayId: string,
  contents: DisplayEventContents,
  timeout: number | null
) => {
  const useLocal = PUBLIC_TETHER_HOST === "localhost";
  const agent = await TetherAgent.create("server", {
    loglevel: "warn",
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: PUBLIC_TETHER_HOST,
      port: useLocal ? 1883 : 8883,
      protocol: useLocal ? "mqtt" : "mqtts"
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

/** It is not strictly **necessary** to publish these messages via Tether/MQTT,
 * since they originate from the display instances and are POSTed via HTTP requests
 * to the server. However, since they are part of the event/realtime system, it
 * makes debugging easier if we are able to subscribe to these messages just like the
 * rest.
 *
 * Recall that the reason we don't use Tether/MQTT from the displays-to-server is that
 * the Netlify application is "serverless" and therefore cannot subscribe to MQTT
 * messages in the usual way - it is not a persistent process and cannot maintain a
 * persisted TCP connection.
 */
const publishDisplayNotification = async (message: DisplayNotifyServer) => {
  const useLocal = PUBLIC_TETHER_HOST === "localhost";
  const agent = await TetherAgent.create("presentation", {
    loglevel: "warn",
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: PUBLIC_TETHER_HOST,
      port: useLocal ? 1883 : 8883,
      protocol: useLocal ? "mqtt" : "mqtts"
    }
  });

  const plug = new OutputPlug(agent, PLUG_NAMES.displayNotifications, {
    id: message.displayId,
    publishOptions: { qos: 1 }
  });

  await plug.publish(encode(message));

  await agent.disconnect();
};

export const handleDisplayNotification = async (
  message: DisplayNotifyServer
) => {
  const { displayId, event } = message;

  await publishDisplayNotification(message);

  const IDLE_STATE: DisplayIdle = {
    name: bRollNaming.IDLE,
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
    await updateScreenStateAndPublish(displayId, IDLE_STATE, null, 2000);
  }

  if (event === "timeout") {
    console.log(
      "A display timed out its current animation, pick something new"
    );
    console.log({ weights: DISPLAY_VIEW_WEIGHTINGS, bRollViews: bRollNaming });
    const pickDisplayType = pickKeysWithWeights(DISPLAY_VIEW_WEIGHTINGS);

    try {
      const contents = await getDataForAmbientDisplay(pickDisplayType);

      await updateScreenStateAndPublish(displayId, contents, 0, BROLL_TIMEOUT);
    } catch (e) {
      console.error(
        "Something went wrong getting a random Display layout: " + e
      );
      await updateScreenStateAndPublish(displayId, IDLE_STATE, null, 2000);
    }
  }
};

export const getDataForAmbientDisplay = async (
  pickDisplayType: bRollNaming
): Promise<DisplayEventContents> => {
  switch (pickDisplayType) {
    case bRollNaming.DETAIL: {
      const allNormalUsers = await db.query.users.findMany({
        where: eq(users.isAdmin, false),
        with: { myGarden: true }
      });
      if (allNormalUsers.length == 0) {
        throw Error("no users to choose from!");
      }
      const pickRandomUser = pickRandomElement(allNormalUsers);

      const userGarden = pickRandomUser.myGarden;
      const gardenWithPlants = await db.query.gardens.findFirst({
        where: eq(gardens.id, userGarden.id),
        with: { plantsInGarden: true }
      });
      if (!gardenWithPlants) {
        throw Error("no plants in user garden");
      }

      const pickRandomPlant = pickRandomElement(
        gardenWithPlants.plantsInGarden
      );
      const thePlant = await db.query.plants.findFirst({
        where: eq(plants.id, pickRandomPlant.plantId)
      });
      if (thePlant === undefined) {
        throw Error("failed to find plant " + pickRandomPlant);
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

    case bRollNaming.DETAIL_MULTI: {
      const allNormalUsers = await db.query.users.findMany({
        where: eq(users.isAdmin, false),
        with: { myGarden: true }
      });
      if (allNormalUsers.length == 0) {
        throw Error("no users to choose from!");
      }
      const pickRandomUsers = pickMultipleRandomElements(
        allNormalUsers,
        MULTIPLE_FEATURED_PLANTS_COUNT
      );

      let results = await Promise.all(
        pickRandomUsers.map(async (u) => {
          const userGarden = u.myGarden;
          const gardenWithPlants = await db.query.gardens.findFirst({
            where: eq(gardens.id, userGarden.id),
            with: { plantsInGarden: true }
          });
          if (!gardenWithPlants) {
            throw Error("no plants in user garden");
          }

          const pickRandomPlant = pickRandomElement(
            gardenWithPlants.plantsInGarden
          );
          const thePlant = await db.query.plants.findFirst({
            where: eq(plants.id, pickRandomPlant.plantId)
          });
          if (thePlant === undefined) {
            throw Error("failed to find plant " + pickRandomPlant);
          }
          return {
            plant: thePlant,
            user: stripUserInfo(u)
          };
        })
      );

      const contents: DisplayMultipleFeaturedPlants = {
        name: bRollNaming.DETAIL_MULTI,
        contents: results
      };
      return contents;
    }

    case bRollNaming.STATUS_FEED: {
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
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plantsInGarden: { with: { plant: true } } }
        })
      ).filter((g) => g.myOwner.isAdmin === false);
      const gardens = pickMultipleRandomElements(allGardens, NUM_GARDENS_MULTI);
      const contents: DisplayStatusFeed = {
        name: bRollNaming.STATUS_FEED,
        contents: {
          eventLogs: latestEvents.map(
            (entry) => entry.contents as FeedTextEntry
          ),
          gardens
        }
      };
      return contents;
    }

    case bRollNaming.ROLL_PAN: {
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plantsInGarden: { with: { plant: true } } }
        })
      ).filter((g) => g.myOwner.isAdmin === false);
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

    case bRollNaming.ZOOM_OUT: {
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plantsInGarden: true }
        })
      ).filter((g) => g.myOwner.isAdmin === false);
      const pickGarden = pickRandomElement(allGardens);
      const plantsInGarden = await db.query.gardensToPlants.findMany({
        where: eq(gardensToPlants.gardenId, pickGarden.id),
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

    case bRollNaming.TOP_LIST: {
      // TODO: This is probably not a slow query, but certainly a very big payload,
      // potentially: it is ALL gardens with ALL plant details for EVERY plant in
      // each garden, plus all user details.
      // An orderBy + LIMIT would probably help, but this would require a join.
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plantsInGarden: true }
        })
      ).filter((g) => g.myOwner.isAdmin === false);

      if (allGardens.length < LIMIT_LEADERBOARD) {
        throw Error("Not enough gardens for leaderboard");
      }

      const orderedByPlantCount = allGardens
        .filter((g) => g.myOwner.isAdmin === false)
        .sort((a, b) => {
          return b.plantsInGarden.length - a.plantsInGarden.length;
        })
        .slice(0, LIMIT_LEADERBOARD);

      const topGarden = orderedByPlantCount[0];
      const topGardenWithPlants = await db.query.gardens.findFirst({
        where: eq(gardens.id, topGarden.id),
        with: { plantsInGarden: { with: { plant: true } } }
      });
      if (!topGardenWithPlants) {
        throw Error("failed to load top garden with plants");
      }

      const contents: DisplayLeaderboard = {
        name: bRollNaming.TOP_LIST,
        contents: {
          topPollinators: orderedByPlantCount.map((garden) => ({
            username: garden.myOwner.username,
            count: garden.plantsInGarden.length
          })),
          topGarden: topGardenWithPlants
        }
      };
      return contents;
    }

    case bRollNaming.STATISTICS_1: {
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plantsInGarden: true }
        })
      ).filter((g) => g.myOwner.isAdmin === false);
      const pickGarden = pickRandomElement(allGardens);
      const plantsInGarden = await db.query.gardensToPlants.findMany({
        with: { plant: true },
        where: eq(gardensToPlants.gardenId, pickGarden.id)
      });
      const pickPlant = pickRandomElement(plantsInGarden);
      const user = await db.query.users.findFirst({
        where: eq(users.id, pickGarden.userId)
      });
      if (!user || !pickPlant) {
        throw Error("user/plant info missing");
      }
      const contents: DisplayPlantGrowingTime = {
        name: bRollNaming.STATISTICS_1,
        contents: {
          plant: pickPlant.plant,
          user: stripUserInfo(user)
        }
      };
      return contents;
    }
    case bRollNaming.STATISTICS_2: {
      const [result] = await db.select({ count: count() }).from(plants);
      const allGardens = (
        await db.query.gardens.findMany({
          with: {
            plantsInGarden: { with: { plant: true } },
            myOwner: true
          }
        })
      ).filter((g) => g.myOwner.isAdmin === false);

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

    case bRollNaming.STATISTICS_3: {
      const allNormalUsers = await db.query.users.findMany({
        where: eq(users.isAdmin, false)
      });

      const pickUser = pickRandomElement(allNormalUsers);

      console.log("pick user", pickUser.username, "from", allNormalUsers);

      const userPlants = await db.query.plants.findMany({
        where: or(
          eq(plants.authorTop, pickUser.id),
          eq(plants.authorBottom, pickUser.id)
        )
      });

      const pickPlant = pickRandomElement(userPlants);

      const asParentCount = await db
        .select({ id: plants.id, name: plants.commonName })
        .from(plants)
        .where(
          or(eq(plants.parent1, pickPlant.id), eq(plants.parent2, pickPlant.id))
        );

      console.log(
        "plant",
        pickPlant,
        "appears as parent",
        asParentCount.length,
        "times"
      );

      const contents: DisplayPlantPollinationStats = {
        name: bRollNaming.STATISTICS_3,
        contents: {
          plant: pickPlant,
          pollinationCount: asParentCount.length,
          user: stripUserInfo(pickUser)
        }
      };

      return contents;
    }

    case bRollNaming.IDLE: {
      return {
        name: bRollNaming.IDLE,
        contents: null
      };
    }

    default: {
      throw Error(
        "unknown pickDisplayType: " + JSON.stringify({ pickDisplayType })
      );
    }
  }
};

export const showMainEvent = async (latestEvent: SimpleEvent) => {
  switch (latestEvent.name) {
    case "newUser": {
      // Ignore new user events for now
      break;
    }
    case "newUserFirstPlant": {
      const PRIORITY = 1;
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
        await updateScreenStateAndPublish(targetScreen, e, PRIORITY, NEW_USER_TIMEOUT);
      }
      break;
    }
    case "newPlantPollination": {
      const PRIORITY = 1;
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
              NEW_PLANT_TIMEOUT
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

export const getAllScreens = async () =>
  await db.select().from(presentationState);

/** Publish updates on channel, persist to database */
export const updateScreenStateAndPublish = async (
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
        throw Error("parents not in payload: " + JSON.stringify(event.payload));
      }
      const plantTop = await db.query.plants.findFirst({
        where: eq(plants.id, parent1)
      });
      const plantBottom = await db.query.plants.findFirst({
        where: eq(plants.id, parent2)
      });
      if (!plantTop || !plantBottom) {
        throw Error(
          "Failed to find plant details for " +
          JSON.stringify({ plantTop, plantBottom })
        );
      }
      const { authorTop, authorBottom } = event.payload;
      if (!authorTop || !authorBottom) {
        throw Error(
          "Missing user IDS for " + JSON.stringify({ authorTop, authorBottom })
        );
      }
      const authorTopUser = await db.query.users.findFirst({
        where: eq(users.id, authorTop)
      });
      const authorBottomUser = await db.query.users.findFirst({
        where: eq(users.id, authorBottom)
      });

      if (!authorTopUser || !authorBottomUser) {
        throw Error(
          "Failed to find user details for " +
          JSON.stringify({ authorTop, authorBottom })
        );
      }
      return [
        {
          text: `${authorTopUser.username}'s ${plantTop.commonName}`,
          highlight: true
        },
        {
          text: "just pollinated"
        },
        {
          text: `${authorBottomUser.username}'s ${plantBottom.commonName}`,
          highlight: true
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

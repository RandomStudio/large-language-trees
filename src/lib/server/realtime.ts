import { BROKER_DEFAULTS, encode, OutputPlug, TetherAgent } from "tether-agent";
import { v4 as uuidv4 } from "uuid";

import { db } from "./db";
import {
  eventLogs,
  gardens,
  gardensToPlants,
  plants,
  presentationState,
  users
} from "./schema";
import { count, desc, eq, or } from "drizzle-orm";
import {
  bRollNaming,
  SimpleEventNames,
  type DisplayEvent,
  type DisplayFeaturedGarden,
  type DisplayFeaturedPlant,
  type DisplayFirstPlant,
  type DisplayIdle,
  type DisplayLeaderboard,
  type DisplayMultipleFeaturedPlants,
  type DisplayMultipleGardens,
  type DisplayNewPollinatedSprout,
  type DisplayPlantCount,
  type DisplayPlantGrowingTime,
  type DisplayPlantPollinationStats,
  type DisplayStatusFeed,
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
  POLLINATION_RESULT_TIMEOUT,
  NEW_USER_TIMEOUT,
  NUM_GARDENS_MULTI,
  PLUG_NAMES,
  MULTI_DETAIL_TIMEOUT,
  IDLE_TIMEOUT
} from "$lib/constants";
import { PUBLIC_TETHER_HOST } from "$env/static/public";

/**
 * Server-side publishing of a SimpleEvent, i.e a relay from
 * our server out to Tether/MQTT.
 *
 * This involves connecting, publishing and then disconecting from
 * Tether, because we cannot keep a persistent server-side client
 * in Netlify.
 */
export const publishEvent = async (incoming: SimpleEvent) => {
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
    id: incoming.name,
    publishOptions: { qos: 2 }
  });

  const { name, payload } = incoming;
  console.log("Publishing event", { name, payload }, "...");

  await plug.publish(encode({ name, payload }));

  await agent.disconnect();

  await logSimpleEvents(incoming);

  const displayEvent = await getDisplayEvent(incoming);
  if (displayEvent) {
    const { event, priority } = displayEvent;
    await updateScreenStateAndPublish(event, priority);
  }
};

const publishDisplayInstructions = async (
  targetDisplayId: string,
  contents: DisplayEvent,
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

  const message: DisplayEvent = {
    name: contents.name,
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

  // await publishDisplayNotification(message);

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

    const event: DisplayIdle = {
      name: bRollNaming.IDLE,
      payload: null,
      targetDisplayId: message.displayId,
      timeout: IDLE_TIMEOUT
    };

    // Add an idle state with a short timeout, so that the new
    // display will be assigned a "B-roll" state soon...
    await updateScreenStateAndPublish(event, null);
  }

  if (event === "timeout") {
    //  A display timed out its current animation, pick something new
    const pickDisplayType = pickKeysWithWeights(DISPLAY_VIEW_WEIGHTINGS);

    // check if display is DETAIL_MULTI
    const timeout =
      pickDisplayType === bRollNaming.DETAIL_MULTI
        ? MULTI_DETAIL_TIMEOUT
        : BROLL_TIMEOUT;

    let event = null;

    while (event === null) {
      event = await getEventForAmbientDisplay(
        pickDisplayType,
        displayId,
        timeout
      );
    }

    await updateScreenStateAndPublish(event, null);
  }
};

export const getEventForAmbientDisplay = async (
  pickDisplayType: bRollNaming,
  targetDisplayId: string,
  timeout: number
): Promise<DisplayEvent | null> => {
  switch (pickDisplayType) {
    case bRollNaming.DETAIL: {
      const allNormalUsers = await db.query.users.findMany({
        where: eq(users.isAdmin, false),
        with: { myGarden: true }
      });
      if (allNormalUsers.length == 0) {
        console.log("no users to choose from!");
        return null;
      }
      const pickRandomUser = pickRandomElement(allNormalUsers);

      const userGarden = pickRandomUser.myGarden;
      const gardenWithPlants = await db.query.gardens.findFirst({
        where: eq(gardens.id, userGarden.id),
        with: { plants: true }
      });
      if (!gardenWithPlants) {
        console.log("no plants in user garden");
        return null;
      }

      const pickRandomPlant = pickRandomElement(gardenWithPlants.plants);
      const thePlant = await db.query.plants.findFirst({
        where: eq(plants.id, pickRandomPlant.plantId)
      });
      if (!thePlant) {
        console.log("failed to find plant " + pickRandomPlant);
        return null;
      }
      const event: DisplayFeaturedPlant = {
        name: bRollNaming.DETAIL,
        payload: {
          user: stripUserInfo(pickRandomUser),
          plant: thePlant
        },
        targetDisplayId,
        timeout
      };
      return event;
    }

    case bRollNaming.DETAIL_MULTI: {
      const allNormalUsers = await db.query.users.findMany({
        where: eq(users.isAdmin, false),
        with: { myGarden: true }
      });
      if (allNormalUsers.length == 0) {
        console.log("no users to choose from!");
        return null;
      }
      const pickRandomUsers = pickMultipleRandomElements(
        allNormalUsers,
        MULTIPLE_FEATURED_PLANTS_COUNT
      );

      let results = await Promise.all(
        pickRandomUsers.map(async (u) => {
          const userGarden = u.myGarden;
          const userPlants = await db.query.gardens.findFirst({
            where: eq(gardens.id, userGarden.id),
            with: { plants: true }
          });
          if (!userPlants) {
            throw Error("no plants in user garden");
          }

          const pickRandomPlant = pickRandomElement(userPlants.plants);
          const thePlant = await db.query.plants.findFirst({
            where: eq(plants.id, pickRandomPlant.plantId)
          });
          if (!thePlant) {
            throw Error("failed to find plant " + pickRandomPlant);
          }
          return {
            plant: thePlant,
            user: stripUserInfo(u)
          };
        })
      );

      const event: DisplayMultipleFeaturedPlants = {
        name: bRollNaming.DETAIL_MULTI,
        payload: results,
        targetDisplayId,
        timeout
      };
      return event;
    }

    case bRollNaming.STATUS_FEED: {
      const latestEvents = await db
        .select()
        .from(eventLogs)
        .orderBy(desc(eventLogs.timestamp))
        .limit(LIMIT_STATUS_FEED);
      if (latestEvents.length < MIN_STATUS_FEED) {
        console.log(
          `Not enough event logs (${latestEvents.length} < ${MIN_STATUS_FEED}) to show this view`
        );
      }
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plants: { with: { plant: true } } }
        })
      ).filter((g) => g.myOwner.isAdmin === false);
      const pickGarden = pickMultipleRandomElements(
        allGardens,
        NUM_GARDENS_MULTI
      );
      const event: DisplayStatusFeed = {
        name: bRollNaming.STATUS_FEED,
        payload: {
          eventLogs: latestEvents.map(
            (entry) => entry.contents as FeedTextEntry
          ),
          gardens: pickGarden.map((g) => ({
            ...g,
            plants: g.plants.map((p) => p.plant)
          }))
        },
        targetDisplayId,
        timeout
      };
      return event;
    }

    case bRollNaming.ROLL_PAN: {
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plants: { with: { plant: true } } }
        })
      ).filter((g) => g.myOwner.isAdmin === false);
      if (allGardens.length < 5) {
        console.log("Not enough gardens to display count=" + NUM_GARDENS_MULTI);
        return null;
      }
      const pickGardens = pickMultipleRandomElements(
        allGardens,
        NUM_GARDENS_MULTI
      );

      const event: DisplayMultipleGardens = {
        name: bRollNaming.ROLL_PAN,
        payload: pickGardens.map((garden) => ({
          garden: {
            ...garden,
            plants: garden.plants.map((p) => p.plant)
          },
          user: stripUserInfo(garden.myOwner)
        })),
        targetDisplayId,
        timeout
      };
      return event;
    }

    case bRollNaming.ZOOM_OUT: {
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plants: { with: { plant: true } } }
        })
      ).filter((g) => g.myOwner.isAdmin === false);
      const garden = pickRandomElement(allGardens);
      const event: DisplayFeaturedGarden = {
        name: bRollNaming.ZOOM_OUT,
        payload: {
          garden: {
            ...garden,
            plants: garden.plants.map((p) => p.plant)
          },
          user: stripUserInfo(garden.myOwner)
        },
        targetDisplayId,
        timeout
      };
      return event;
    }

    case bRollNaming.TOP_LIST: {
      // TODO: This is probably not a slow query, but certainly a very big payload,
      // potentially: it is ALL gardens with ALL plant details for EVERY plant in
      // each garden, plus all user details.
      // An orderBy + LIMIT would probably help, but this would require a join.
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plants: true }
        })
      ).filter((g) => g.myOwner.isAdmin === false);

      if (allGardens.length < LIMIT_LEADERBOARD) {
        console.log("Not enough gardens for leaderboard");
        return null;
      }

      const orderedByPlantCount = allGardens
        .filter((g) => g.myOwner.isAdmin === false)
        .sort((a, b) => {
          return b.plants.length - a.plants.length;
        })
        .slice(0, LIMIT_LEADERBOARD);

      const topGarden = orderedByPlantCount[0];
      const topGardenWithPlants = await db.query.gardens.findFirst({
        where: eq(gardens.id, topGarden.id),
        with: { plants: { with: { plant: true } } }
      });
      if (!topGardenWithPlants) {
        console.log("failed to load top garden with plants");
        return null;
      }

      const event: DisplayLeaderboard = {
        name: bRollNaming.TOP_LIST,
        payload: {
          topPollinators: orderedByPlantCount.map((garden) => ({
            username: garden.myOwner.username,
            count: garden.plants.length
          })),
          topGarden: {
            ...topGardenWithPlants,
            plants: topGardenWithPlants.plants.map((p) => p.plant)
          }
        },
        targetDisplayId,
        timeout
      };
      return event;
    }

    case bRollNaming.STATISTICS_1: {
      const allGardens = (
        await db.query.gardens.findMany({
          with: { myOwner: true, plants: true }
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
      const event: DisplayPlantGrowingTime = {
        name: bRollNaming.STATISTICS_1,
        payload: {
          plant: pickPlant.plant,
          user: stripUserInfo(user),
          pollinationTimestamp: pickPlant.plantingDate
        },
        targetDisplayId,
        timeout
      };
      return event;
    }
    case bRollNaming.STATISTICS_2: {
      const [result] = await db.select({ count: count() }).from(plants);
      const allGardens = (
        await db.query.gardens.findMany({
          with: {
            plants: { with: { plant: true } },
            myOwner: true
          }
        })
      ).filter((g) => g.myOwner.isAdmin === false);

      const pickGardens = pickMultipleRandomElements(
        allGardens,
        NUM_GARDENS_MULTI
      );

      const event: DisplayPlantCount = {
        name: bRollNaming.STATISTICS_2,
        payload: {
          gardens: pickGardens.map((garden) => ({
            garden: {
              ...garden,
              plants: garden.plants.map((p) => p.plant)
            },
            user: stripUserInfo(garden.myOwner)
          })),
          count: result.count
        },
        targetDisplayId,
        timeout
      };
      return event;
    }

    case bRollNaming.STATISTICS_3: {
      const allNormalUsers = await db.query.users.findMany({
        where: eq(users.isAdmin, false)
      });

      const pickUser = pickRandomElement(allNormalUsers);

      // console.log("pick user", pickUser.username, "from", allNormalUsers);

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

      const event: DisplayPlantPollinationStats = {
        name: bRollNaming.STATISTICS_3,
        payload: {
          plant: pickPlant,
          pollinationCount: asParentCount.length,
          user: stripUserInfo(pickUser)
        },
        targetDisplayId,
        timeout
      };

      return event;
    }

    case bRollNaming.IDLE: {
      return {
        name: bRollNaming.IDLE,
        payload: null,
        targetDisplayId,
        timeout
      };
    }

    default: {
      throw Error(
        "unknown pickDisplayType: " + JSON.stringify({ pickDisplayType })
      );
    }
  }
};

export const getDisplayEvent = async (
  incoming: SimpleEvent
): Promise<{ event: DisplayEvent; priority: number } | null> => {
  switch (incoming.name) {
    case "newUserFirstPlant": {
      const priority = 1;
      const targetDisplayId = await findScreenFor(priority);
      if (targetDisplayId) {
        const { user, plant } = incoming.payload;
        const event: DisplayFirstPlant = {
          name: "newUserFirstPlant",
          payload: {
            plant,
            user
          },
          targetDisplayId,
          timeout: NEW_USER_TIMEOUT
        };
        return { event, priority };
      }
    }
    case "newPlantSprouted": {
      const priority = 1;
      const targetDisplayId = await findScreenFor(priority);
      if (!targetDisplayId) {
        console.warn("No available display found");
        return null;
      }
      const plant = incoming.payload;
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
          const event: DisplayNewPollinatedSprout = {
            name: "newPlantPollination",
            payload: {
              newPlant: plant,
              authorTop: stripUserInfo(authorTop),
              authorBottom: stripUserInfo(authorBottom),
              plantTop,
              plantBottom
            },
            targetDisplayId,
            timeout: POLLINATION_RESULT_TIMEOUT
          };
          return { event, priority };
        } else {
          console.error(
            "author(s) not found in DB:",
            plant.authorTop,
            plant.authorBottom
          );
          return null;
        }
      } else {
        console.error("author(s) missing from", { plant });
        return null;
      }
    }
    default: {
      // No corresponding DisplayEvent for the incoming SimpleEvent
      return null;
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
  event: DisplayEvent,
  priority: number | null
) => {
  const { timeout, targetDisplayId } = event;
  await db
    .update(presentationState)
    .set({ contents: event, priority })
    .where(eq(presentationState.id, targetDisplayId));
  await publishDisplayInstructions(targetDisplayId, event, timeout);
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
    case SimpleEventNames.NEW_USER: {
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
    case SimpleEventNames.FIRST_PLANT: {
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
    case SimpleEventNames.POLLINATION_COMPLETE: {
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
    // case "newTopPollinator": {
    //   return [
    //     {
    //       text: `${event.payload.user.username}'s ${event.payload.plant.commonName}`,
    //       highlight: true
    //     },
    //     {
    //       text: "just became top pollinator"
    //     }
    //   ];
    // }
    case "newPollinationStarting": {
      return [];
    }
    case "newGeneratedPlantReady": {
      return []; // TODO: this entry should be ignored entirely
    }
    default: {
      throw Error(`unknown event "${event}"`);
    }
  }
};

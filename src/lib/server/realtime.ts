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
import { eq, or } from "drizzle-orm";
import {
  DisplayEventNames,
  SimpleEventNames,
  type DisplayEvent,
  type DisplayFeaturedGarden,
  type DisplayFeaturedPlant,
  type DisplayFirstPlant,
  type DisplayIdle,
  type DisplayMultipleFeaturedPlants,
  type DisplayMultipleGardens,
  type DisplayNewPollinatedSprout,
  type DisplayPlantGrowingTime,
  type DisplayPlantPollinationStats,
  type DisplayPollinationStarting,
  type EventFirstPlant,
  type EventNewSprouting,
  type EventNewUser,
  type EventPollinationStarting,
  type SimpleEventTypes
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
  MULTIPLE_FEATURED_PLANTS_COUNT,
  POLLINATION_RESULT_TIMEOUT,
  NEW_USER_TIMEOUT,
  NUM_GARDENS_MULTI,
  PLUG_NAMES,
  MULTI_DETAIL_TIMEOUT,
  IDLE_TIMEOUT,
  POLLINATION_START_TIMEOUT
} from "$lib/constants";
import { PUBLIC_TETHER_HOST } from "$env/static/public";
import type { RefreshDisplays } from "../../routes/api/displays/types";
import type { EventLog, GardenWithPlants, SelectGarden } from "$lib/types";
import { capitalise } from "$lib/promptUtils";

/**
 * Server-side publishing of a SimpleEvent, i.e a relay from
 * our server out to Tether/MQTT.
 *
 * This involves connecting, publishing and then disconecting from
 * Tether, because we cannot keep a persistent server-side client
 * in Netlify.
 */
export const publishEvent = async (incoming: SimpleEventTypes) => {
  const useLocal = PUBLIC_TETHER_HOST === "localhost";

  const agent = await TetherAgent.create("server", {
    loglevel: "warn",
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      ...BROKER_DEFAULTS.nodeJS,
      host: PUBLIC_TETHER_HOST,
      hostname: PUBLIC_TETHER_HOST,
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
    const { event, priority, targetDisplayId } = displayEvent;
    await updateScreenStateAndPublish(event, targetDisplayId, priority);
  }
};

export const publishDisplayInstructions = async (
  event: DisplayEvent,
  targetDisplayId: string
) => {
  const useLocal = PUBLIC_TETHER_HOST === "localhost";
  const agent = await TetherAgent.create("server", {
    loglevel: "warn",
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: PUBLIC_TETHER_HOST,
      hostname: PUBLIC_TETHER_HOST,
      port: useLocal ? 1883 : 8883,
      protocol: useLocal ? "mqtt" : "mqtts"
    }
  });

  const plug = new OutputPlug(agent, PLUG_NAMES.displayInstructions, {
    id: targetDisplayId,
    publishOptions: { qos: 2 }
  });

  console.log("Publishing screen content update", event.name);

  await plug.publish(encode(event));

  await agent.disconnect();
};

export const publishDisplayRefresh = async (action: RefreshDisplays) => {
  const useLocal = PUBLIC_TETHER_HOST === "localhost";
  const agent = await TetherAgent.create("server", {
    loglevel: "warn",
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: PUBLIC_TETHER_HOST,
      hostname: PUBLIC_TETHER_HOST,
      port: useLocal ? 1883 : 8883,
      protocol: useLocal ? "mqtt" : "mqtts"
    }
  });

  console.log(
    "publishDisplayRefresh on MQTT broker",
    PUBLIC_TETHER_HOST,
    "..."
  );

  const plug = new OutputPlug(agent, "refresh", {
    publishOptions: { qos: 2 }
  });

  await plug.publish(encode(action));
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
export const rePublishDisplayNotification = async (
  message: DisplayNotifyServer
) => {
  const useLocal = PUBLIC_TETHER_HOST === "localhost";
  const agent = await TetherAgent.create("presentation", {
    loglevel: "warn",
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: PUBLIC_TETHER_HOST,
      hostname: PUBLIC_TETHER_HOST,
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

  // This is not strictly required, and slows things down
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
      name: DisplayEventNames.IDLE,
      payload: null,
      timeout: IDLE_TIMEOUT
    };

    // Add an idle state with a short timeout, so that the new
    // display will be assigned a "B-roll" state soon...
    await updateScreenStateAndPublish(event, displayId, null);
  }

  if (event === "timeout") {
    //  A display timed out its current animation, pick something new
    const pickDisplayType = pickKeysWithWeights(DISPLAY_VIEW_WEIGHTINGS);

    // check if display is DETAIL_MULTI
    const timeout =
      pickDisplayType === DisplayEventNames.DETAIL_MULTI
        ? MULTI_DETAIL_TIMEOUT
        : BROLL_TIMEOUT;

    let event = null;
    let attemptsLeft = 10;

    while (event === null && attemptsLeft > 0) {
      try {
        event = await getEventForAmbientDisplay(pickDisplayType, timeout);
      } catch (e) {
        console.warn("getting ambient event failed:", e);
      }
      attemptsLeft--;
    }

    if (event === null) {
      console.error("After 10 attempts, no suitable ambient event was found!");
      console.warn("IDLE event will be sent instead");
      await updateScreenStateAndPublish(
        {
          name: DisplayEventNames.IDLE,
          payload: null,
          timeout: IDLE_TIMEOUT
        },
        displayId,
        null
      );
    } else {
      await updateScreenStateAndPublish(event, displayId, null);
    }
  }
};

const gardensToNestedPlants = async (
  gardenEntries: SelectGarden[]
): Promise<GardenWithPlants[]> => {
  const queries = gardenEntries.map(async (g) => {
    const gardenWithPlants = await db.query.gardens.findFirst({
      where: eq(gardens.id, g.id),
      with: { plants: { with: { plant: true } } }
    });
    if (!gardenWithPlants) {
      throw Error("garden should match");
    }
    return gardenWithPlants;
  });
  const res = (await Promise.all(queries)).map((g) => ({
    ...g,
    plants: g.plants.map((p) => p.plant)
  }));
  return res;
};

export const getEventForAmbientDisplay = async (
  pickDisplayType: DisplayEventNames,
  timeout: number
): Promise<DisplayEvent | null> => {
  switch (pickDisplayType) {
    case DisplayEventNames.DETAIL: {
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
        name: DisplayEventNames.DETAIL,
        payload: {
          user: stripUserInfo(pickRandomUser),
          plant: thePlant
        },
        timeout
      };
      return event;
    }

    case DisplayEventNames.DETAIL_MULTI: {
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

      const results = await Promise.all(
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
        name: DisplayEventNames.DETAIL_MULTI,
        payload: {
          plantImages: results.map((p) => p.plant.imageUrl || "")
        },
        timeout
      };
      return event;
    }

    case DisplayEventNames.ROLL_PAN: {
      const allGardens = (
        await db.query.gardens.findMany({
          // note plants are just bare relation details,
          // not full plant contents!
          with: { myOwner: true, plants: true }
        })
      ).filter((g) => g.myOwner.isAdmin === false && g.plants.length > 0);
      if (allGardens.length < 5) {
        console.log("Not enough gardens to display count=" + NUM_GARDENS_MULTI);
        return null;
      }
      const gardensWithPlants = await gardensToNestedPlants(allGardens);

      const pickGardens = pickMultipleRandomElements(
        gardensWithPlants,
        NUM_GARDENS_MULTI
      );

      const event: DisplayMultipleGardens = {
        name: DisplayEventNames.ROLL_PAN,
        payload: pickGardens,
        timeout
      };
      return event;
    }

    case DisplayEventNames.ZOOM_OUT: {
      const allGardens = (
        await db.query.gardens.findMany({
          // note plants are just bare relation details,
          // not full plant contents!
          with: { myOwner: true, plants: true }
        })
      ).filter((g) => g.myOwner.isAdmin === false);

      const gardensWithPlants = await gardensToNestedPlants(allGardens);

      const garden = pickRandomElement(gardensWithPlants);
      const myOwner = allGardens.find(
        (g) => g.myOwner.id === garden.userId
      )?.myOwner;

      if (!myOwner) {
        throw Error("owner could not be linked back to garden");
      }

      const event: DisplayFeaturedGarden = {
        name: DisplayEventNames.ZOOM_OUT,
        payload: {
          garden,
          user: stripUserInfo(myOwner)
        },
        timeout
      };
      return event;
    }

    case DisplayEventNames.STATS_TIME: {
      const allGardens = (
        await db.query.gardens.findMany({
          // note plants are just bare relation details,
          // not full plant contents!
          with: { myOwner: true, plants: true }
        })
      ).filter((g) => g.myOwner.isAdmin === false && g.plants.length > 0);
      const pickGarden = pickRandomElement(allGardens);
      const plantsInGarden = await db.query.gardensToPlants.findMany({
        where: eq(gardensToPlants.gardenId, pickGarden.id),
        with: { plant: true }
      });
      const onlyNewPlants = plantsInGarden.filter(
        (p) => p.plant.parent1 !== null
      );
      if (onlyNewPlants.length === 0) {
        throw Error("no new plants for this garden");
      }
      const pickPlant = pickRandomElement(onlyNewPlants);
      const user = await db.query.users.findFirst({
        where: eq(users.id, pickGarden.userId)
      });
      if (!user || !pickPlant) {
        throw Error("user/plant info missing");
      }
      const event: DisplayPlantGrowingTime = {
        name: DisplayEventNames.STATS_TIME,
        payload: {
          plant: pickPlant.plant,
          user: stripUserInfo(user),
          pollinationTimestamp: pickPlant.plantingDate
        },
        timeout
      };
      return event;
    }

    case DisplayEventNames.STATS_POLLINATIONS: {
      const allNormalUsers = await db.query.users.findMany({
        where: eq(users.isAdmin, false)
      });

      if (allNormalUsers.length === 0) {
        throw Error("no normal users to pick from");
      }

      const pickUser = pickRandomElement(allNormalUsers);

      if (!pickUser) {
        throw Error("no user to pick");
      }

      const userWithPlants = await db.query.users.findFirst({
        where: eq(users.id, pickUser.id),
        with: { myGarden: { with: { plants: { with: { plant: true } } } } }
      });

      if (!userWithPlants || userWithPlants.myGarden.plants.length === 0) {
        throw Error("user has no plants");
      }

      const originalPlant = userWithPlants.myGarden.plants.find((p) => {
        const { plant } = p;
        return plant.authorTop === null && plant.authorBottom === null;
      });

      if (!originalPlant) {
        throw Error("no original plant for this user");
      }

      const asParentCount = await db
        .select({ id: plants.id, name: plants.commonName })
        .from(plants)
        .where(
          or(
            eq(plants.parent1, originalPlant.plant.id),
            eq(plants.parent2, originalPlant.plant.id)
          )
        );

      // console.log(
      //   "plant",
      //   originalPlant,
      //   "appears as parent",
      //   asParentCount.length,
      //   "times"
      // );

      const event: DisplayPlantPollinationStats = {
        name: DisplayEventNames.STATS_POLLINATIONS,
        payload: {
          plant: originalPlant.plant,
          pollinationCount: asParentCount.length,
          user: stripUserInfo(pickUser)
        },
        timeout
      };

      return event;
    }

    case DisplayEventNames.IDLE: {
      return {
        name: DisplayEventNames.IDLE,
        payload: null,
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
  incoming: SimpleEventTypes
): Promise<{
  event: DisplayEvent;
  priority: number;
  targetDisplayId: string;
} | null> => {
  switch (incoming.name) {
    case "newUserFirstPlant": {
      const priority = 1;
      const targetDisplayId = await findScreenFor(priority);
      if (targetDisplayId) {
        const { user, plant } = incoming.payload;
        const event: DisplayFirstPlant = {
          name: DisplayEventNames.ANNOUNCE_FIRST_PLANT,
          payload: {
            plant,
            user
          },
          timeout: NEW_USER_TIMEOUT
        };
        return { event, priority, targetDisplayId };
      }
      return null;
    }
    case "newPollinationStarting": {
      const priority = 1;
      const targetDisplayId = await findScreenFor(priority);
      if (targetDisplayId) {
        const { authorTop, authorBottom, plantTop, plantBottom } =
          incoming.payload;
        const event: DisplayPollinationStarting = {
          name: DisplayEventNames.ANNOUNCE_POLLINATION_STARTING,
          payload: {
            authorTop,
            authorBottom,
            plantTop,
            plantBottom
          },
          timeout: POLLINATION_START_TIMEOUT
        };
        return { event, priority, targetDisplayId };
      }
      return null;
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
            name: DisplayEventNames.ANNOUNCE_NEW_SPROUT,
            payload: {
              newPlant: plant,
              authorTop: stripUserInfo(authorTop),
              authorBottom: stripUserInfo(authorBottom)
            },
            timeout: POLLINATION_RESULT_TIMEOUT
          };
          return { event, priority, targetDisplayId };
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
  targetDisplayId: string,
  priority: number | null
) => {
  await db
    .update(presentationState)
    .set({ contents: event, priority })
    .where(eq(presentationState.id, targetDisplayId));
  await publishDisplayInstructions(event, targetDisplayId);
};

/** Because of our serverless architecture, we cannot listen using TCP
 * socket "constantly" to incoming events on the server side. Therefore,
 * we append logs to a DB table in order to have a persistent list
 * we can read from when required (e.g. for "status feed").
 *
 * TODO: Some basic log management is possible here; if the table has more than EVENT_LOG_MAX
 * entries, we should delete older entries.
 */
export const logSimpleEvents = async (event: SimpleEventTypes) => {
  const contents = await eventToLog(event);
  if (contents) {
    const res = await db
      .insert(eventLogs)
      .values({ id: uuidv4(), contents })
      .returning();
    await publishEventLogUpdate(res[0]);
  }
};

const publishEventLogUpdate = async (entry: EventLog) => {
  const useLocal = PUBLIC_TETHER_HOST === "localhost";
  const agent = await TetherAgent.create("presentation", {
    loglevel: "warn",
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: PUBLIC_TETHER_HOST,
      hostname: PUBLIC_TETHER_HOST,
      port: useLocal ? 1883 : 8883,
      protocol: useLocal ? "mqtt" : "mqtts"
    }
  });

  const plug = new OutputPlug(agent, PLUG_NAMES.eventLogs, {
    publishOptions: { qos: 1 }
  });

  await plug.publish(encode(entry));
};

const eventToLog = async (event: SimpleEventTypes): Promise<string | null> => {
  switch (event.name) {
    case SimpleEventNames.NEW_USER: {
      const { payload } = event as EventNewUser;
      return `${capitalise(payload.username)} entered the garden`;
    }
    case SimpleEventNames.FIRST_PLANT: {
      const { payload } = event as EventFirstPlant;
      return `${capitalise(payload.user.username)}'s ${capitalise(
        payload.plant.commonName
      )} just sprouted in the Garden`;
    }
    case SimpleEventNames.POLLINATION_COMPLETE: {
      const { payload } = event as EventNewSprouting;
      const { parent1, parent2, commonName } = payload;
      if (!parent1 || !parent2) {
        throw Error("no parents for this plant; new sprout?");
      }
      const { authorTop, authorBottom } = payload;
      if (!authorTop || !authorBottom) {
        throw Error(
          "Missing user IDS for " + JSON.stringify({ authorTop, authorBottom })
        );
      }
      const authorTopUser = await db.query.users.findFirst({
        columns: { id: true, username: true },
        where: eq(users.id, authorTop)
      });
      const authorBottomUser = await db.query.users.findFirst({
        columns: { id: true, username: true },
        where: eq(users.id, authorBottom)
      });

      if (!authorTopUser || !authorBottomUser) {
        throw Error(
          "Failed to find user details for " +
            JSON.stringify({ authorTop, authorBottom })
        );
      }
      return `${capitalise(commonName)} sprouted by ${capitalise(
        authorTopUser.username
      )} ♡ ${capitalise(authorBottomUser.username)}`;
    }

    case SimpleEventNames.POLLINATION_STARTING: {
      const { payload } = event as EventPollinationStarting;
      const { authorTop, authorBottom } = payload;
      return `${capitalise(authorTop.username)} is pollinating ${capitalise(
        authorBottom.username
      )}`;
    }
    case SimpleEventNames.CANDIDATE_READY: {
      return null;
    }
    default: {
      throw Error(`unknown event "${event}"`);
    }
  }
};

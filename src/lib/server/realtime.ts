import type { EventBody, EventTypes } from "$lib/types";
import { BROKER_DEFAULTS, encode, OutputPlug, TetherAgent } from "tether-agent";
import { db } from "./db";
import { presentationState } from "./schema";
import { eq } from "drizzle-orm";

export const publishEvent = async (event: EventBody) => {
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

  await updatePresentationDisplays(event as EventTypes);
};

const publishDisplayUpdate = async (
  targetScreenId: string,
  contents: object
) => {
  const agent = await TetherAgent.create("server", {
    brokerOptions: {
      ...BROKER_DEFAULTS.nodeJS,
      host: "50e2193c64234fd18838db7ad6711592.s1.eu.hivemq.cloud",
      port: 8883,
      protocol: "mqtts"
    }
  });

  const plug = new OutputPlug(agent, "displayUpdates", {
    id: targetScreenId,
    publishOptions: { qos: 2, retain: true }
  });

  console.log("Publishing screen conten update", { name, contents }, "...");

  await plug.publish(encode(contents));

  await agent.disconnect();
};

const updatePresentationDisplays = async (latestEvent: EventTypes) => {
  switch (latestEvent.name) {
    case "newUser": {
      const { userId, username } = latestEvent.payload;
      const targetScreen = await findScreenFor(1);
      await updateScreen(
        targetScreen.id,
        {
          title: "New user joined",
          username,
          userId
        },
        1
      );
      break;
    }
    case "newUserFirstPlant": {
      const plant = latestEvent.payload;
      break;
    }
    case "newPlantPollination": {
      const plant = latestEvent.payload;
      break;
    }
    default: {
      console.error("Unknown event type!", latestEvent);
    }
  }
};

/** Find a screen that is available to display a view with a given priority level.
 * In the case where no suitable screens are available, the one updated last (least
 * recent update) will be returned instead.
 */
const findScreenFor = async (priority: number) => {
  // Ordered by last updated ASC, i.e. oldest (last-updated) screen first
  const screens = await db
    .select()
    .from(presentationState)
    .orderBy(presentationState.lastUpdated);

  const screenWithLowerPriority = screens.find((s) =>
    s.priority === null ? true : s.priority < priority
  );

  if (!screenWithLowerPriority) {
    console.warn(
      `All screens occupied with same or higher priority; will use "oldest" instead`
    );
  }

  let targetScreen = screenWithLowerPriority || screens[0];

  return targetScreen;
};

const updateScreen = async (
  targetId: string,
  contents: object,
  priority: number
) => {
  await db
    .update(presentationState)
    .set({ contents, priority })
    .where(eq(presentationState.id, targetId));
};

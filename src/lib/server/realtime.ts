import type { EventBody } from "$lib/types";
import { BROKER_DEFAULTS, encode, OutputPlug, TetherAgent } from "tether-agent";

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
};

<script lang="ts">
  import type { PresentationDisplayState } from "$lib/types";
  import { onDestroy, onMount } from "svelte";
  import {
    BROKER_DEFAULTS,
    decode,
    InputPlug,
    parseAgentIdOrGroup,
    TetherAgent
  } from "tether-agent";

  let connected = false;
  let messages: string[] = [];

  let agent: TetherAgent | null = null;

  export let data: { displays: PresentationDisplayState[] };

  onMount(async () => {
    agent = await TetherAgent.create("presentation", {
      brokerOptions: {
        ...BROKER_DEFAULTS.browser,
        host: "50e2193c64234fd18838db7ad6711592.s1.eu.hivemq.cloud",
        port: 8884,
        protocol: "wss",
        path: "/mqtt"
      }
    });

    connected = true;

    const eventPlug = await InputPlug.create(agent, "events");

    eventPlug.on("message", (payload, topic) => {
      console.log("received message on", topic);
      const decoded = decode(payload);
      console.log(JSON.stringify(decoded));
      // messages.push(JSON.stringify(decoded));
      messages = [...messages, JSON.stringify(decoded)];
      console.log(messages.length);
    });

    const displayPlug = await InputPlug.create(agent, "displayUpdates");

    displayPlug.on("message", (payload, topic) => {
      const decoded = decode(payload) as object;
      console.log(JSON.stringify(payload));

      const screenId = parseAgentIdOrGroup(topic);

      const targetDisplay = data.displays.find((s) => s.id === screenId);
      if (targetDisplay) {
        targetDisplay.contents = decoded;
      } else {
        console.error(
          "Could not match target screen ID",
          screenId,
          "with displays in",
          JSON.stringify(data.displays.map((d) => d.id))
        );
        throw Error("Could not match target display");
      }
    });
  });

  onDestroy(async () => {
    connected = false;
    agent?.disconnect();
  });
</script>

<h1>Presentation Views: Debug</h1>
<div>
  Tether: {connected ? "✅ connected" : "❌ not connected"}
</div>

<h2>Incoming Events</h2>
<h3>Received {messages.length} events</h3>
<ul>
  {#each messages as m}
    <li>{m}</li>
  {/each}
</ul>

{#if data}
  <h2>Presentation State</h2>
  <ul>
    {#each data.displays as display}
      <li>
        <h3>
          #{display.id}: "{display.name}"
        </h3>
        <p>
          Contents: {display.contents === null
            ? "empty"
            : JSON.stringify(display.contents)}
        </p>
        <p>
          Last updated: {display.lastUpdated === null
            ? "unknown"
            : display.lastUpdated}
        </p>
      </li>
    {/each}
  </ul>
{/if}

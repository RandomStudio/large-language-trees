<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import type { DisplayUpdateMessage } from "$lib/events.types.js";
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

  export let data;

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

    const displayInstructionsPlug = await InputPlug.create(
      agent,
      "serverInstructDisplays"
    );

    displayInstructionsPlug.on("message", (payload, topic) => {
      invalidateAll();

      //   const screenId = parseAgentIdOrGroup(topic);

      //   const targetDisplay = data.displays.find((s) => s.id === screenId);
      //   if (targetDisplay) {
      //     console.log(
      //       "change targetDisplay",
      //       targetDisplay,
      //       "to content",
      //       decoded.contents
      //     );

      //   } else {
      //     console.error(
      //       "Could not match target screen ID",
      //       screenId,
      //       "with displays in",
      //       JSON.stringify(data.displays.map((d) => d.id))
      //     );
      //     throw Error("Could not match target display");
      //   }
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

{#if data}
  <h2>Presentation State</h2>
  <ul>
    {#each data.displays as display}
      <li>
        <h3>
          Display "{display.id}"
        </h3>
        <p>
          Contents: {display.contents === null
            ? "empty"
            : JSON.stringify(display.contents)}
        </p>
      </li>
    {/each}
  </ul>
{/if}

<h2>Incoming Events</h2>
<h3>Received {messages.length} events</h3>
<div>
  {#each messages as m}
    <div>{m}</div>
  {/each}
</div>

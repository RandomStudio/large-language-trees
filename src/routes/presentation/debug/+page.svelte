<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    BROKER_DEFAULTS,
    decode,
    InputPlug,
    TetherAgent
  } from "tether-agent";

  let messages: string[] = [];

  let agent: TetherAgent | null = null;

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

    const incoming = await InputPlug.create(agent, "events");
    incoming.on("message", (payload, topic) => {
      console.log("received message on", topic);
      const decoded = decode(payload);
      console.log(JSON.stringify(decoded));
      // messages.push(JSON.stringify(decoded));
      messages = [...messages, JSON.stringify(decoded)];
      console.log(messages.length);
    });
  });

  onDestroy(async () => {
    agent?.disconnect();
  });
</script>

<h1>This is the debug mode for Presentation views</h1>

<h2>Incoming Events</h2>
<h3>Received {messages.length} events</h3>
<ul>
  {#each messages as m}
    <li>{m}</li>
  {/each}
</ul>

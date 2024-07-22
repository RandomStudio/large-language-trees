<script lang="ts">
  import { onMount } from "svelte";
  import { BROKER_DEFAULTS, TetherAgent } from "tether-agent";

  let messages = [];

  let agent: TetherAgent | null = null;

  onMount(async () => {
    agent = await TetherAgent.create("presentation", {
      brokerOptions: {
        ...BROKER_DEFAULTS.browser,
        host: "50e2193c64234fd18838db7ad6711592.s1.eu.hivemq.cloud",
        port: 8884,
        protocol: "wss"
      }
    });
  });
</script>

<h1>This is the debug mode for Presentation views</h1>

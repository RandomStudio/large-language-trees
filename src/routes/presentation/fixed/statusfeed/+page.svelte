<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import type { RefreshDisplays } from "../../../api/displays/types";
  import { PLUG_NAMES } from "$lib/constants";
  import { invalidateAll } from "$app/navigation";
  import type { EventLog } from "$lib/types";
  import Idle from "../../shared-components/Idle.svelte";

  export let data;

  let agent: TetherAgent | null = null;

  let alternateOffset = 0;

  onMount(async () => {
    agent = await TetherAgent.create("presentation", {
      brokerOptions: BROWSER_CONNECTION,
      id: "leaderboard"
    });

    const feedEventLogs = await InputPlug.create(agent, "eventLogs");
    feedEventLogs.on("message", (payload) => {
      alternateOffset++;
      const log = decode(payload) as EventLog;
      console.log("new event log", log);
      invalidateAll();
    });

    const refreshPlug = await InputPlug.create(agent, "refresh");
    refreshPlug.on("message", (payload) => {
      console.log("refresh message");
      const m = decode(payload) as RefreshDisplays;
      if (m.action === "reload") {
        console.info("Server requested reload...");
        location.reload();
      }
    });
  });

  onDestroy(() => {
    if (agent) {
      agent.disconnect();
    }
  });

  const isAlternateColour = (count: number, index: number): boolean => {
    return (index + alternateOffset) % 2 === 0;
  };
</script>

{#if data.logs.length === 0}
  <Idle />
{/if}
<div
  class="w-full h-full items-center justify-center bg-purple-950 text-pink-300"
>
  {#each data.logs as log, index}
    <div
      class="py-8 px-4 w-full font-primerb text-medium text-purple"
      class:bg-pink-300={isAlternateColour(data.logs.length, index)}
      class:text-purple-950={isAlternateColour(data.logs.length, index)}
    >
      {log}
    </div>
  {/each}
</div>

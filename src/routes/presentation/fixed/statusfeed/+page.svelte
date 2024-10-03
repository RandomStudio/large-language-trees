<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import type { RefreshDisplays } from "../../../api/displays/types";
  import type { EventLog } from "$lib/types";
  import Idle from "../../shared-components/Idle.svelte";
  import { flip } from "svelte/animate";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";

  export let data;

  let currentLogs = data.logs;
  let messageIndex = data.logs.length;

  let agent: TetherAgent | null = null;

  onMount(async () => {
    agent = await TetherAgent.create("presentation", {
      brokerOptions: BROWSER_CONNECTION,
      id: "statusfeed"
    });

    const feedEventLogs = await InputPlug.create(agent, "eventLogs");
    feedEventLogs.on("message", (payload) => {
      messageIndex++;
      const log = decode(payload) as EventLog;
      console.log("New log decoded", log);

      const formattedLog = {
        contents: log.contents,
        messageIndex
      };

      currentLogs = [formattedLog, ...currentLogs]
        .sort((a, b) => b.messageIndex - a.messageIndex)
        .slice(0, 14);
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
</script>

{#if currentLogs.length === 0}
  <Idle />
{/if}
<div
  class="w-full h-full items-center justify-center bg-purple-950 text-pink-300 animatedList"
>
  {#each currentLogs as log, index (log.messageIndex)}
    <div
      class="py-8 px-4 w-full font-primer text-medium text-purple"
      class:bg-roel_rose={log.messageIndex % 2 === 0}
      class:text-purple-950={log.messageIndex % 2 === 0}
      animate:flip
    >
      {log.contents}
    </div>
  {/each}
</div>

<SiteUrl background="green" />

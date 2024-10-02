<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    decode,
    InputPlug,
    parseAgentIdOrGroup,
    TetherAgent
  } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import { SimpleEventNames, type EventFirstPlant } from "$lib/events.types";
  import { invalidateAll } from "$app/navigation";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";
  import type { RefreshDisplays } from "../../../api/displays/types";
  import BigGarden from "./BigGarden.svelte";
  import { page } from "$app/stores";
  import { startAmbience, stopAmbience } from "../../AudioEngine";

  export let data;

  let agent: TetherAgent | null = null;

  onMount(async () => {
    agent = await TetherAgent.create("presentation", {
      brokerOptions: BROWSER_CONNECTION,
      id: "overview"
    });

    const newPlantsPlug = await InputPlug.create(agent, "events", {});
    newPlantsPlug.on("message", (payload, topic) => {
      const grouping = parseAgentIdOrGroup(topic);
      console.log({ topic, grouping });
      if (
        grouping === SimpleEventNames.FIRST_PLANT ||
        grouping === SimpleEventNames.POLLINATION_COMPLETE
      ) {
        invalidateAll();
      }
    });

    const refreshPlug = await InputPlug.create(agent, "refresh");
    refreshPlug.on("message", (payload) => {
      const m = decode(payload) as RefreshDisplays;
      if (m.action === "reload") {
        console.info("Server requested reload...");
        location.reload();
      }
    });

    const muted = $page.url.searchParams.get("muted");
    if (muted && muted !== "false") {
      console.warn("ambience muted");
    } else {
      console.log("No muted seachparams; play ambient sound...");
      startAmbience();
    }
  });

  onDestroy(() => {
    stopAmbience();
  });
</script>

<div
  class="w-full h-full flex items-center justify-center presentation-gradient"
>
  <div
    class="w-full text-center text-roel_green text-4xl font-gyst absolute top-16 z-[2000] uppercase"
  >
    Bird's Eye View
  </div>
  <BigGarden width={520} height={1400} plants={data.dedupPlantList} />
</div>

<SiteUrl />

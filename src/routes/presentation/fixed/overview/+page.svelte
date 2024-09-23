<script lang="ts">
  import { onMount } from "svelte";
  import DisplayGarden from "../../shared-components/DisplayGarden.svelte";
  import {
    decode,
    InputPlug,
    parseAgentIdOrGroup,
    TetherAgent
  } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import { SimpleEventNames, type EventFirstPlant } from "$lib/events.types";
  import { invalidateAll } from "$app/navigation";

  export let data;

  let agent: TetherAgent | null = null;

  onMount(async () => {
    agent = await TetherAgent.create("presentation", {
      brokerOptions: BROWSER_CONNECTION,
      id: "leaderboard"
    });

    const newPlantsPlug = await InputPlug.create(agent, "events", {});
    newPlantsPlug.on("message", (payload, topic) => {
      const grouping = parseAgentIdOrGroup(topic);
      console.log({ topic, grouping });
      if (
        grouping === SimpleEventNames.FIRST_PLANT ||
        grouping === SimpleEventNames.POLLINATION_COMPLETE
      ) {
        console.log("new plant!");
        invalidateAll();
      }
    });
  });
</script>

<div
  class="w-full h-full flex items-center justify-center presentation-gradient"
>
  <div
    class="w-full text-center text-roel_yellow text-4xl font-gyst absolute top-16 z-[2000] uppercase"
  >
    Bird's Eye View
  </div>
  <DisplayGarden
    width={520}
    height={1400}
    garden={data.gardenWithPlants}
    showGardenName={false}
  />
</div>

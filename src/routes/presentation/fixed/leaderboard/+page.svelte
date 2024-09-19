<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { InputPlug, TetherAgent } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import { PLUG_NAMES } from "$lib/constants";
  import { SimpleEventNames } from "$lib/events.types";
  import { invalidateAll } from "$app/navigation";
  import DisplayGarden from "../../shared-components/DisplayGarden.svelte";

  export let data;

  let agent: TetherAgent | null = null;

  onMount(async () => {
    agent = await TetherAgent.create("presentation", {
      brokerOptions: BROWSER_CONNECTION,
      id: "leaderboard"
    });

    const newSproutPlug = await InputPlug.create(
      agent,
      PLUG_NAMES.simpleEvents,
      { id: SimpleEventNames.POLLINATION_COMPLETE }
    );
    newSproutPlug.on("message", (payload) => {
      console.log("new sprouting; recalculate leaderboard...");
      invalidateAll();
    });
  });

  onDestroy(() => {
    if (agent) {
      agent.disconnect();
    }
  });
</script>

<div class="w-screen h-screen items-center justify-center standard-gradient">
  <div
    class="w-screen text-center text-roel_yellow text-4xl font-gyst absolute top-32 z-10 uppercase"
  >
    Most Active<br />
    Pollinators
  </div>

  <DisplayGarden
    width={window.innerWidth}
    garden={data.topGardenWithPlants}
    yGarden={window.innerHeight / 8}
  />

  <div
    class="w-screen text-center text-new_purple text-4xl font-gyst absolute bottom-32 z-10 uppercase"
  >
    {#each data.gardensWithPlantCounts as { user, count }}
      <div>
        <span>
          {user.username}
        </span>
        <span>
          x{count}
        </span>
      </div>
    {/each}
  </div>
</div>

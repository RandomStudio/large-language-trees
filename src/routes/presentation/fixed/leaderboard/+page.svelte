<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { InputPlug, TetherAgent, decode } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import { PLUG_NAMES } from "$lib/constants";
  import { SimpleEventNames } from "$lib/events.types";
  import { invalidateAll } from "$app/navigation";
  import DisplayGarden from "../../shared-components/DisplayGarden.svelte";
  import type { RefreshDisplays } from "../../../api/displays/types";
  import Idle from "../../shared-components/Idle.svelte";

  export let data;

  let agent: TetherAgent | null = null;

  onMount(async () => {
    agent = await TetherAgent.create("presentation", {
      brokerOptions: BROWSER_CONNECTION,
      id: "leaderboard"
    });

    const newUserFirstPlantPlug = await InputPlug.create(
      agent,
      PLUG_NAMES.simpleEvents,
      { id: SimpleEventNames.NEW_USER }
    );
    newUserFirstPlantPlug.on("message", (payload) => {
      console.log("new user; recalculate leaderboard...");
      setTimeout(() => {
        invalidateAll();
      }, 2000);
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

{#if data.topGardenWithPlants}
  {#if data.gardensWithPlantCounts.length === 0 || data.topGardenWithPlants.plants.length === 0}
    <Idle />
  {:else}
    <div
      class="w-full h-full flex items-center justify-center presentation-gradient"
    >
      <div
        class="w-full text-center text-roel_yellow text-4xl font-gyst absolute top-32 z-10 uppercase"
      >
        Most Active<br />
        Pollinators
      </div>

      <DisplayGarden width={500} garden={data.topGardenWithPlants} />

      <div
        class="w-full text-center text-new_purple text-4xl font-gyst absolute bottom-32 z-10 uppercase"
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
  {/if}
{:else}
  <Idle />
{/if}

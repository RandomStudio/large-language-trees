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
  import SiteUrl from "../../shared-components/SiteUrl.svelte";
  import type { GardenWithPlants } from "$lib/types";
  import { fade, slide } from "svelte/transition";

  export let data;

  let agent: TetherAgent | null = null;

  let counter = 0;
  let currentFeaturedGarden: GardenWithPlants | null = null;

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

    currentFeaturedGarden =
      data.featuredGardens[counter % data.featuredGardens.length];
    setInterval(() => {
      counter++;
      currentFeaturedGarden =
        data.featuredGardens[counter % data.featuredGardens.length];
      console.log("picked", currentFeaturedGarden.name);
    }, 8000);
  });

  onDestroy(() => {
    if (agent) {
      agent.disconnect();
    }
  });
</script>

{#if data.gardensWithPlantCounts.length === 0}
  <Idle />
{:else}
  <div
    class="w-full h-full flex flex-col items-center pink-gradient-halfscreen"
  >
    <div class="h-[45vh]">
      <div
        class="text-left text-roel_purple text-7xl font-gyst capitalize px-8 bg-roel_rose py-6"
      >
        <div>Most Active</div>
        <div>Pollinators</div>
      </div>

      <div class="w-screen opacity">
        {#each data.gardensWithPlantCounts as { user, count }}
          <div
            class="odd:bg-roel_purple odd:text-roel_rose even:text-roel_purple even:bg-roel_rose px-8 py-6 text-[48px] flex flex-row justify-between"
          >
            <div class="capitalize">
              {user.username}
            </div>
            <div>
              x{count}
            </div>
          </div>
        {/each}
      </div>
    </div>

    {#if currentFeaturedGarden}
      {#key currentFeaturedGarden.id}
        <div transition:fade={{ duration: 1000 }} class="absolute bottom-40">
          <DisplayGarden
            disableAnimations={true}
            width={600}
            height={900}
            garden={currentFeaturedGarden}
          />
        </div>
      {/key}
    {/if}
  </div>
{/if}

<SiteUrl />

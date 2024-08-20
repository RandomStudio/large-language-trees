<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "./DisplayGarden.svelte";
  export let topPollinators;
  export let topGarden: GardenWithPlants;
</script>

<div class="bg-roel_purple w-screen h-screen flex flex-col justify-end">
  <div
    class="w-full h-[65vh] flex items-end pb-[1vh] text-left pl-8 text-roel_purple text-9xl font-gyst bg-gradient-to-t from-roel_rose from-20% to-roel_blue to-80%"
  >
    Most Active
    <br />Pollinators:
  </div>

  <DisplayGarden
    garden={topGarden}
    xGarden={0}
    yGarden={200}
    width={540}
    height={540}
    showGardenName={true}
    showPlantName={false}
    colorBGText={"roel_rose"}
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>

  {#each topPollinators as userInfo, index}
    <div
      class="w-full h-[7vh] flex items-center justify-between px-10 {index %
        2 ===
      0
        ? 'bg-roel_purple'
        : 'bg-roel_rose'}"
    >
      <div
        class="text-5xl font-primer {index % 2 === 0
          ? 'text-roel_rose'
          : 'text-roel_purple'}"
      >
        {userInfo.username}
      </div>
      <div
        class="text-5xl font-primer {index % 2 === 0
          ? 'text-roel_rose'
          : 'text-roel_purple'}"
      >
        x {userInfo.count}
      </div>
    </div>
  {/each}
</div>

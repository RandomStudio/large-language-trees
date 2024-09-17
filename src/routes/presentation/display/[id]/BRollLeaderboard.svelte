<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "./DisplayGarden.svelte";
  export let topPollinators;
  export let topGarden: GardenWithPlants;
</script>

<div class="bg-new_purple w-screen h-screen flex flex-col justify-end">
  <div
    class="w-full h-[65vh] flex items-end text-left pl-8 text-new_purple text-9xl font-gyst bg-gradient-to-t from-roel_rose from-20% to-roel_blue to-80%"
  >
    <div
      class="w-screen z-[9999] bg-gradient-to-t from-roel_rose from-20% pb-[1vh]"
    >
      Most Active
      <br />Pollinators:
    </div>
  </div>

  <div class="absolute w-full h-full scale-150">
    <DisplayGarden
      garden={topGarden}
      xGarden={-40}
      yGarden={200}
      width={540}
      height={540}
      showGardenName={true}
      showPlantName={false}
      colorBGText={"roel_rose"}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
  </div>

  {#each topPollinators as userInfo, index}
    <div
      class="w-full h-[7vh] flex items-center justify-between px-10 z-[9999] {index %
        2 ===
      0
        ? 'bg-new_purple'
        : 'bg-roel_rose'}"
    >
      <div
        class="text-5xl font-primer {index % 2 === 0
          ? 'text-roel_rose'
          : 'text-new_purple'}"
      >
        {userInfo.username}
      </div>
      <div
        class="text-5xl font-primer {index % 2 === 0
          ? 'text-roel_rose'
          : 'text-new_purple'}"
      >
        x {userInfo.count}
      </div>
    </div>
  {/each}
</div>

<script lang="ts">
  import type { GardenWithPlants, PublicUserInfo } from "$lib/types";
  import DisplayGarden from "./DisplayGarden.svelte";
  export let count: number;
  export let gardens: { garden: GardenWithPlants; user: PublicUserInfo }[];
</script>

<div class="bg-roel_green w-full min-h-screen relative overflow-hidden">
  <div
    style="position: absolute; top: 0vh; height: 76vh; width: 100vw; overflow: hidden;"
  >
    <svg
      viewBox="0 0 1000 2151"
      xmlns="http://www.w3.org/2000/svg"
      style="width: 100%; height: 100%;"
      preserveAspectRatio="none"
      class="fill-roel_purple"
    >
      <path
        d="M500 2151C223.858 2151 0 1927.142 0 1651V1501H1000V1651C1000 1927.142 776.142 2151 500 2151ZM1000 1501H0V0H1000V1501Z"
      />

      <path
        d="M500 2151C223.858 2151 0 1927.142 0 1651V1501H1000V1651C1000 1927.142 776.142 2151 500 2151ZM1000 1501H0V0H1000V1501Z"
      />
    </svg>
  </div>

  <DisplayGarden
    xGarden={0}
    yGarden={0}
    height={300}
    width={300}
    garden={gardens[0].garden}
    showGardenName={false}
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={240}
    yGarden={250}
    height={300}
    width={300}
    garden={gardens[1].garden}
    showGardenName={false}
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={0}
    yGarden={500}
    height={300}
    width={300}
    garden={gardens[2].garden}
    showGardenName={false}
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={240}
    yGarden={750}
    height={300}
    width={300}
    garden={gardens[3].garden}
    showGardenName={false}
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>

  <div
    class="w-full flex text-center items-center justify-center absolute bottom-[180px] text-roel_purple text-4xl font-primer"
  >
    There are currently
  </div>
  <div
    class="w-full flex text-center items-center justify-center absolute bottom-[110px] text-roel_purple text-7xl font-jeanb"
  >
    {count} PLANTS
  </div>
  <div
    class="w-full flex text-center items-center justify-center absolute bottom-[70px] text-roel_purple text-4xl font-primer"
  >
    growing in the garden!
  </div>
</div>

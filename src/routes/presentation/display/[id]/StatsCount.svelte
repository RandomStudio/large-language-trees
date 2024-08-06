<script lang="ts">
  import type { GardenWithPlants, PublicUserInfo } from "$lib/types";
  import DisplayGarden from "./DisplayGarden.svelte";
  export let count: number;
  export let gardens: { garden: GardenWithPlants; user: PublicUserInfo }[];
</script>

<div class="bg-roel_yellow w-full h-screen relative overflow-hidden">
  <div class="fill-roel_red absolute top-0 w-full h-auto">
    <svg viewBox="0 0 1000 2151" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="svgClip">
          <path
            d="M500 2151C223.858 2151 0 1927.142 0 1651V1501H1000V1651C1000 1927.142 776.142 2151 500 2151ZM1000 1501H0V0H1000V1501Z"
          />
        </clipPath>
      </defs>
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
  ></DisplayGarden>
  <DisplayGarden
    xGarden={240}
    yGarden={250}
    height={300}
    width={300}
    garden={gardens[1].garden}
    showGardenName={false}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={0}
    yGarden={500}
    height={300}
    width={300}
    garden={gardens[2].garden}
    showGardenName={false}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={240}
    yGarden={750}
    height={300}
    width={300}
    garden={gardens[3].garden}
    showGardenName={false}
  ></DisplayGarden>

  <div
    class="w-full flex text-center items-center justify-center absolute bottom-[180px] text-roel_red text-4xl font-primer"
  >
    There are currently
  </div>
  <div
    class="w-full flex text-center items-center justify-center absolute bottom-[110px] text-roel_red text-6xl font-jeanb"
  >
    {count} PLANTS
  </div>
  <div
    class="w-full flex text-center items-center justify-center absolute bottom-[60px] text-roel_red text-4xl font-primer"
  >
    growing in the garden!
  </div>
</div>

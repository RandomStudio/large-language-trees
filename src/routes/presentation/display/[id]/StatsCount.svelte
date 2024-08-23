<script lang="ts">
  import type { GardenWithPlants, PublicUserInfo } from "$lib/types";
  import DisplayGarden from "./DisplayGarden.svelte";
  export let count: number;
  export let gardens: { garden: GardenWithPlants; user: PublicUserInfo }[];
</script>

<div
  class="w-screen h-screen relative bg-gradient-to-t from-roel_green from-20% to-roel_blue to-80% overflow-hidden"
>
  <div class="absolute z-0 scale-[2]">
    <DisplayGarden
      xGarden={-250}
      yGarden={-250}
      height={500}
      width={500}
      garden={gardens[0].garden}
      showGardenName={false}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={-70}
      yGarden={-130}
      height={500}
      width={500}
      garden={gardens[1].garden}
      showGardenName={false}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={-280}
      yGarden={70}
      height={500}
      width={500}
      garden={gardens[2].garden}
      showGardenName={false}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={-50}
      yGarden={200}
      height={500}
      width={500}
      garden={gardens[3].garden}
      showGardenName={false}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
  </div>

  <div
    class="absolute w-screen h-screen flex flex-col justify-end py-[3vh] z-9999"
  >
    <div
      class="w-screen h-auto text-center text-roel_purple text-5xl font-primer pb-[1.5vh]"
    >
      There are currently
    </div>
    <div
      class="w-screen h-auto text-center text-roel_purple text-9xl font-gyst"
    >
      {count} Plants
    </div>
    <div
      class="w-screen h-auto text-center text-roel_purple text-5xl font-primer"
    >
      growing in the garden!
    </div>
  </div>
</div>

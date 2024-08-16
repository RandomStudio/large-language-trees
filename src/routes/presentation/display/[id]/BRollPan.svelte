<script lang="ts">
  import type { DisplayMultipleGardens } from "$lib/events.types";
  import DisplayGarden from "./DisplayGarden.svelte";
  export let gardens: DisplayMultipleGardens;
</script>

<div class="relative bg-roel_purple w-screen h-screen">
  <DisplayGarden
    xGarden={0}
    yGarden={0}
    height={350}
    width={350}
    garden={gardens.contents[0].garden}
    showGardenName={true}
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={190}
    yGarden={300}
    height={350}
    width={350}
    garden={gardens.contents[1].garden}
    showGardenName={true}
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={0}
    yGarden={600}
    height={350}
    width={350}
    garden={gardens.contents[2].garden}
    showGardenName={true}
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={190}
    yGarden={900}
    height={350}
    width={350}
    garden={gardens.contents[3].garden}
    showGardenName={true}
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>

  <div
    class="w-full flex text-left items-left left-[90px] justify-start absolute bottom-[20px] text-roel_green text-4xl font-primer"
  >
    Join the Garden!
  </div>
</div>

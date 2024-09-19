<script lang="ts">
  import type { DisplayMultipleGardens } from "$lib/events.types";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicIn, cubicInOut, cubicOut } from "svelte/easing";
  import { BROLL_TIMEOUT } from "$lib/constants";

  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "../../shared-components/DisplayGarden.svelte";
  export let gardens: GardenWithPlants[];

  const duration = BROLL_TIMEOUT + 2000; //ms
  const START_POSITION = -20;
  const END_POSITION = -180;

  let pan = tweened(START_POSITION, { duration });

  const getPosition = (index: number): { x: number; y: number } => {
    const xOffset = 100;
    const yOffset = 100;
    return {
      x: index % 2 === 0 ? -xOffset : xOffset,
      y: index * 100
    };
  };

  onMount(() => {
    pan.set(END_POSITION);
  });
</script>

<div
  class="w-screen h-screen items-center justify-center standard-gradient-rotated"
>
  {#each gardens as garden, index}
    <DisplayGarden
      xGarden={getPosition(index).x}
      yGarden={getPosition(index).y}
      height={700}
      width={700}
      {garden}
      showGardenName={true}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
  {/each}

  <div
    class="w-screen h-screen flex text-center justify-center absolute items-end py-[3vh] text-roel_green text-9xl font-gyst"
  >
    Join <br /> the Garden!
  </div>
</div>

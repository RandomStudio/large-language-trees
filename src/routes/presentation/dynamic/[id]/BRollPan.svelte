<script lang="ts">
  import type { DisplayMultipleGardens } from "$lib/events.types";
  import { onMount } from "svelte";
  import { BROLL_TIMEOUT } from "$lib/constants";

  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "../../shared-components/DisplayGarden.svelte";
  import { tweened } from "svelte/motion";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";
  export let gardens: GardenWithPlants[];

  const GARDEN_WIDTH = 700;
  const GARDEN_HEIGHT = 700;

  const duration = BROLL_TIMEOUT; //ms
  const START_POSITION = GARDEN_WIDTH / 2;
  const END_POSITION = ((-gardens.length / 2) * GARDEN_WIDTH) / 2;

  const Y_OFFSET = 100;
  const X_OFFSET = GARDEN_WIDTH / 2;

  let pan = tweened(START_POSITION, { duration });

  const getOffsets = (
    index: number,
    pan: number
  ): { x: number; y: number } => ({
    x: index * X_OFFSET + pan + pan * index * 0.1,
    y: index % 2 === 0 ? Y_OFFSET : -Y_OFFSET
  });

  onMount(() => {
    pan.set(END_POSITION);
  });
</script>

<div class="w-screen h-screen flex flex-col items-center justify-center">
  <div
    class="relative"
    style:width={`${GARDEN_WIDTH}px`}
    style:height={`${GARDEN_HEIGHT}px`}
  >
    {#each gardens as garden, index}
      <div
        class="absolute"
        style:left={getOffsets(index, $pan).x + "px"}
        style:top={getOffsets(index, $pan).y + "px"}
      >
        <DisplayGarden
          width={GARDEN_WIDTH}
          height={GARDEN_HEIGHT}
          {garden}
          showGardenName={true}
        ></DisplayGarden>
      </div>
    {/each}
  </div>

  <div
    class="w-full text-center text-roel_purple text-4xl font-gyst absolute bottom-32 z-10 uppercase"
  >
    Join <br /> the Garden!
  </div>
</div>

<SiteUrl />
<SiteUrl position="top" background="green" />

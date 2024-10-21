<script lang="ts">
  import type { DisplayMultipleGardens } from "$lib/events.types";
  import { onMount } from "svelte";
  import { BROLL_TIMEOUT, FADE_DURATION } from "$lib/constants";

  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "../../shared-components/DisplayGarden.svelte";
  import { tweened } from "svelte/motion";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";
  export let gardens: GardenWithPlants[];

  import { fade } from "svelte/transition";

  const GARDEN_WIDTH = 700;
  const GARDEN_HEIGHT = 700;

  const duration = BROLL_TIMEOUT + 2000; //ms
  const START_POSITION = GARDEN_WIDTH / 2;
  const END_POSITION = -GARDEN_WIDTH / 2;

  const Y_OFFSET = 100;
  const X_OFFSET = GARDEN_WIDTH / 10;

  let pan = tweened(START_POSITION, { duration });

  const getOffsets = (
    index: number,
    pan: number
  ): { x: number; y: number; z: number } => {
    const isEven = index % 2 === 0;
    const startX = isEven ? index * X_OFFSET : index * -X_OFFSET;
    const speed = index * 0.2;
    return {
      x: GARDEN_WIDTH / 2 + startX + pan + pan * speed,
      y: speed * 1000,
      z: 1
    };
  };

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
    {#each gardens as garden, index (garden.id)}
      <div
        transition:fade={{ duration: FADE_DURATION }}
        class="absolute"
        style:left={getOffsets(index, $pan).x + "px"}
        style:top={getOffsets(index, $pan).y - GARDEN_HEIGHT / 2 + "px"}
        style:z-index={getOffsets(index, $pan).z}
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

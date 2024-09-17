<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "./DisplayGarden.svelte";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicIn, cubicInOut, cubicOut } from "svelte/easing";
  import { BROLL_TIMEOUT } from "$lib/constants";

  export let userName: string;
  export let garden: GardenWithPlants;

  const duration = BROLL_TIMEOUT; //ms
  const StartScale = 6;
  const EndScale = 2;

  let zoom = tweened(StartScale, { duration, easing: cubicInOut });

  onMount(() => {
    zoom.set(EndScale);
  });
</script>

<div
  class="w-screen h-screen relative overflow-hidden bg-gradient-to-t from-roel_blue from-60% to-roel_rose to-85%"
>
  <div
    class="absolute z-10 w-screen h-[30vh] flex text-center text-new_purple py-[3vh] justify-center text-9xl font-gyst bg-gradient-to-b from-roel_rose from-20%"
  >
    {userName.toUpperCase()}'S <br /> GARDEN
  </div>
  <div class="w-screen h-screen z-0" style="transform: scale({$zoom});">
    <DisplayGarden
      {garden}
      xGarden={-65}
      yGarden={500}
      height={540}
      width={540}
      showGardenName={false}
      showPlantName={false}
      colorBGText="roel_rose"
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
  </div>
  <div
    class="absolute z-5 mbt-0 w-screen h-[100vh] bg-gradient-to-b from-roel_rose from-5% to-40%"
  ></div>
</div>

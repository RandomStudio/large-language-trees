<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "../../shared-components/DisplayGarden.svelte";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicIn, cubicInOut, cubicOut } from "svelte/easing";
  import { BROLL_TIMEOUT } from "$lib/constants";

  export let userName: string;
  export let garden: GardenWithPlants;

  const START_SCALE = 6;
  const END_SCALE = 1;

  let zoom = tweened(START_SCALE, {
    duration: BROLL_TIMEOUT,
    easing: cubicInOut
  });

  onMount(() => {
    zoom.set(END_SCALE);
  });
</script>

<div
  class="w-full h-full flex items-center justify-center presentation-gradient"
>
  <div
    class="w-full text-center text-roel_yellow text-4xl font-gyst absolute top-32 z-10 uppercase"
  >
    {userName.toUpperCase()}'S <br /> GARDEN
  </div>

  <div
    class="absolute"
    style={`width:540px; height:800px;`}
    style:transform={`scale(${$zoom})`}
  >
    <DisplayGarden
      {garden}
      width={540}
      height={800}
      showGardenName={false}
      showPlantName={false}
      colorBGText="roel_rose"
    ></DisplayGarden>
  </div>
</div>

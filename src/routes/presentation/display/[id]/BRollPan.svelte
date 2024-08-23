<script lang="ts">
  import type { DisplayMultipleGardens } from "$lib/events.types";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicIn, cubicInOut, cubicOut } from "svelte/easing";
  import { BROLL_TIMEOUT } from "$lib/constants";

  import DisplayGarden from "./DisplayGarden.svelte";
  export let gardens: DisplayMultipleGardens;

  const duration = BROLL_TIMEOUT + 2000; //ms
  const StartPosition = -20;
  const EndPosition = -180;

  let pan = tweened(StartPosition, { duration });

  onMount(() => {
    pan.set(EndPosition);
  });
</script>

<div
  class="relative w-screen h-screen bg-gradient-to-t from-roel_blue from-30% to-roel_green to-100%"
>
  <div
    style="transform: translateX({$pan}vw) translateY({$pan * 0.4}vw) scale(2);"
  >
    <DisplayGarden
      xGarden={0}
      yGarden={-150}
      height={700}
      width={700}
      garden={gardens.contents[0].garden}
      showGardenName={true}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={50}
      yGarden={300}
      height={700}
      width={700}
      garden={gardens.contents[1].garden}
      showGardenName={true}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={300}
      yGarden={100}
      height={700}
      width={700}
      garden={gardens.contents[2].garden}
      showGardenName={true}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={300}
      yGarden={500}
      height={700}
      width={700}
      garden={gardens.contents[3].garden}
      showGardenName={true}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
  </div>

  <div
    class="absolute mt-[70vh] w-screen h-[30vh] bg-gradient-to-t from-roel_blue from-0% to-100%"
  ></div>

  <div
    class="w-screen h-screen flex text-center justify-center absolute items-end py-[3vh] text-roel_green text-9xl font-gyst"
  >
    Join <br /> the Garden!
  </div>
</div>

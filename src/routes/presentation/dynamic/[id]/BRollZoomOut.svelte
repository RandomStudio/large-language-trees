<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "../../shared-components/DisplayGarden.svelte";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicIn, cubicInOut, cubicOut } from "svelte/easing";
  import { BROLL_TIMEOUT } from "$lib/constants";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";

  export let userName: string;
  export let garden: GardenWithPlants;

  const START_SCALE = 4;
  const END_SCALE = 0.5;

  let ready = false;

  let zoom = tweened(START_SCALE, {
    duration: BROLL_TIMEOUT,
    easing: cubicOut
  });

  onMount(() => {
    setTimeout(() => {
      zoom.set(END_SCALE);
      ready = true;
    });
  });
</script>

<div class="fixed top-0 w-screen h-screen grid grid-cols-1 place-items-center">
  <div
    class="w-full text-center text-roel_green text-4xl font-gyst z-[2000] uppercase transition-opacity"
    style:opacity={ready ? "1.0" : "0"}
  >
    <div>
      {userName}'s'
    </div>
    <div>garden</div>
  </div>

  <div class="w-[1024px] h-[1024px]" style:transform={`scale(${$zoom})`}>
    <DisplayGarden width={1024} height={1024} {garden} showGardenName={false} />
  </div>
</div>

<SiteUrl />
<SiteUrl position="top" background="green" />

<script lang="ts">
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import { capitalise } from "$lib/promptUtils";
  import { BROLL_TIMEOUT } from "$lib/constants";
  import { remap } from "@anselan/maprange";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";
  import { playRandomGrow } from "../../AudioEngine";

  export let plant: SelectPlant;
  export let user: PublicUserInfo;

  let sizePicture: number | null = null;
  const duration = BROLL_TIMEOUT * 1.5; //ms

  // const xStart = Math.floor(Math.random() * (-sizePicture + 540));
  // const xEnd = Math.floor(Math.random() * (-sizePicture + 540));
  // const yStart = Math.floor(Math.random() * (-sizePicture + 1620));
  // const yEnd = Math.floor(Math.random() * (-sizePicture + 1620));

  sizePicture = window.innerHeight * 1.5;
  console.log({ sizePicture });

  const xStart = remap(
    Math.random(),
    [0, 1],
    [-sizePicture / 2, 0],
    true,
    true
  );
  const yStart = remap(
    Math.random(),
    [0, 1],
    [-sizePicture / 2, 0],
    true,
    true
  );

  let x = tweened(xStart, {
    duration: duration,
    easing: cubicOut
  });

  let y = tweened(yStart, {
    duration: duration,
    easing: cubicOut
  });

  onMount(() => {
    x.set(-sizePicture / 3);
    y.set(0);
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
  class="fixed top-32 left-8 px-2 py-2 text-3xl font-primer text-roel_rose bg-new_purple text-center z-10"
>
  {capitalise(user.username)}'s
  {plant.commonName}
</div>
<div
  class="relative overflow-hidden w-full h-full presentation-gradient-rotated"
>
  <div
    class="absolute"
    style:width={`${sizePicture}px`}
    style:height={`${sizePicture}px`}
    style="transform: translateX({$x}px) translateY({$y}px);"
  >
    <div class="absolute font-primer"></div>
    <PlantDisplay imageUrl={plant.imageUrl || ""} applyFilters={false} />
  </div>
</div>

<SiteUrl position="top" />
<SiteUrl position="bottom" background="green" />

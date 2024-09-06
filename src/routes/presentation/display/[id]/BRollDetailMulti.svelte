<script lang="ts">
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicIn, cubicOut } from "svelte/easing";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";

  export let plantsWithusers: { plant: SelectPlant; user: PublicUserInfo }[];
  export let applyFilters: boolean = false;
  export let positionStyles: string = "w-full";

  const sizePicture = 250; //vw
  const duration = 14000; //ms
  const delay = 3000; // ms

  const xStartOdd = -sizePicture / 2.5;
  const xEndOdd = -sizePicture;
  const yStartOdd = sizePicture / 1.3;
  const yEndOdd = -sizePicture * 0.1;

  const xStartEven = xStartOdd / 2;
  const xEndEven = -xEndOdd;
  const yStartEven = yStartOdd;
  const yEndEven = yEndOdd;

  let x1 = tweened(xStartOdd, { duration, easing: cubicIn });
  let y1 = tweened(yStartOdd, { duration, easing: cubicOut });

  let x2 = tweened(xStartEven, { duration, easing: cubicIn });
  let y2 = tweened(yStartEven, { duration, easing: cubicOut });

  let x3 = tweened(xStartOdd, { duration, easing: cubicIn });
  let y3 = tweened(yStartOdd, { duration, easing: cubicOut });

  let x4 = tweened(xStartEven, { duration, easing: cubicIn });
  let y4 = tweened(yStartEven, { duration, easing: cubicOut });

  onMount(() => {
    setTimeout(() => {
      x1.set(xEndOdd);
      y1.set(yEndOdd);
    }, delay * 0);

    setTimeout(() => {
      x2.set(xEndEven);
      y2.set(yEndEven);
    }, delay * 1);

    setTimeout(() => {
      x3.set(xEndOdd);
      y3.set(yEndOdd);
    }, delay * 2);

    setTimeout(() => {
      x4.set(xEndEven);
      y4.set(yEndEven);
    }, delay * 3);
  });

  const plant1 = plantsWithusers[0];
  const plant2 = plantsWithusers[1];
  const plant3 = plantsWithusers[2];
  const plant4 = plantsWithusers[3];
</script>

<div
  class="w-screen h-screen bg-gradient-to-t from-roel_blue from-20% to-roel_rose to-80%"
>
  <div class="images-container">
    <div
      class="target-image"
      style="transform: translateX({$x1}vw) translateY({$y1}vw); width: {sizePicture}vw; height: {sizePicture}vw;"
    >
      <div
        class="absolute text-5xl text-roel_rose bg-roel_purple py-[2vw] px-[2vw] font-primer top-[80vw] right-[80vw] text-center isolate"
      >
        {plant1.user.username}'s
        {plant1.plant.commonName}
      </div>
      <PlantDisplay
        imageUrl={plant1.plant.imageUrl || ""}
        {applyFilters}
        {positionStyles}
      />
    </div>
    <div
      class="target-image"
      style="transform: translateX({$x2}vw) translateY({$y2}vw); width: {sizePicture}vw; height: {sizePicture}vw;"
    >
      <div
        class="absolute text-5xl text-roel_rose bg-roel_purple py-[2vw] px-[2vw] font-primer top-[80vw] left-[80vw] text-center isolate"
      >
        {plant2.user.username}'s
        {plant2.plant.commonName}
      </div>
      <PlantDisplay
        imageUrl={plant2.plant.imageUrl || ""}
        {applyFilters}
        {positionStyles}
      />
    </div>
    <div
      class="target-image"
      style="transform: translateX({$x3}vw) translateY({$y3}vw); width: {sizePicture}vw; height: {sizePicture}vw;"
    >
      <div
        class="absolute text-5xl text-roel_rose bg-roel_purple py-[2vw] px-[2vw] font-primer top-[80vw] right-[80vw] text-center isolate"
      >
        {plant3.user.username}'s
        {plant3.plant.commonName}
      </div>
      <PlantDisplay
        imageUrl={plant3.plant.imageUrl || ""}
        {applyFilters}
        {positionStyles}
      />
    </div>
    <div
      class="target-image"
      style="transform: translateX({$x4}vw) translateY({$y4}vw); width: {sizePicture}vw; height: {sizePicture}vw;"
    >
      <div
        class="absolute text-5xl text-roel_rose bg-roel_purple py-[2vw] px-[2vw] font-primer top-[80vw] left-[80vw] text-center isolate"
      >
        {plant4.user.username}'s
        {plant4.plant.commonName}
      </div>
      <PlantDisplay
        imageUrl={plant4.plant.imageUrl || ""}
        {applyFilters}
        {positionStyles}
      />
    </div>
  </div>
</div>

<style>
  .images-container {
    width: 100vw;
    height: 100vh;
    isolation: isolate;
  }

  .target-image {
    position: absolute;
    object-fit: cover;
    mix-blend-mode: difference;
  }
</style>

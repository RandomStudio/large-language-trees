<script lang="ts">
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let plantsWithusers: { plant: SelectPlant; user: PublicUserInfo }[];

  const sizePicture = 2000;
  const duration = 15000; //ms

  const randomPosition = () => Math.floor(Math.random() * (-sizePicture + 540));
  const randomOffset = () => Math.floor(Math.random() * (-sizePicture + 1620));

  const xStart1 = randomPosition();
  const xEnd1 = randomPosition();
  const yStart1 = randomOffset();
  const yEnd1 = randomOffset();

  let x1 = tweened(xStart1, { duration, easing: cubicOut });
  let y1 = tweened(yStart1, { duration, easing: cubicOut });

  const xStart2 = randomPosition();
  const xEnd2 = randomPosition();
  const yStart2 = randomOffset();
  const yEnd2 = randomOffset();

  let x2 = tweened(xStart2, { duration, easing: cubicOut });
  let y2 = tweened(yStart2, { duration, easing: cubicOut });

  onMount(() => {
    x1.set(xEnd1);
    y1.set(yEnd1);
    x2.set(xEnd2);
    y2.set(yEnd2);
  });

  const plant1 = plantsWithusers[0];
  const plant2 = plantsWithusers[1];
</script>

<div class="viewport bg-roel_rose min-h-screen">
  <div class="camera">
    <div class="images-container">
      <img
        src={plant1.plant.imageUrl}
        alt="Plant"
        class="target-image"
        style="transform: translateX({$x1}px) translateY({$y1}px);"
        crossorigin="anonymous"
      />
      <div>
        <img
          src={plant2.plant.imageUrl}
          alt="Plant"
          class="target-image"
          style="transform: translateX({$x2}px) translateY({$y2}px);"
          crossorigin="anonymous"
        />
        <div
          class="absolute text-3xl text-roel_rose bg-roel_purple py-0.5 px-2 font-primer"
          style="left: {540 / 2 - xEnd2}px; top: {1620 / 2 -
            yEnd2}px;transform: translateX({$x2}px) translateX(-50%) translateY({$y2}px);"
        >
          {plant2.user.username}'s {plant2.plant.commonName}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .viewport {
    overflow: hidden;
    position: relative;
  }

  .camera {
    width: 2000px;
    height: 2000px;
    position: absolute;
    top: 0;
    left: 0;
  }

  .images-container {
    position: relative;
    width: 100%;
    height: 100%;
    isolation: isolate;
  }

  .target-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    mix-blend-mode: hue;
  }
</style>

<script lang="ts">
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let plantsWithusers: { plant: SelectPlant; user: PublicUserInfo }[];

  const sizePicture = 3000;
  const duration = 15000; //ms

  const xStart = Math.floor(Math.random() * (-sizePicture + 540));
  const xEnd = Math.floor(Math.random() * (-sizePicture + 540));
  const yStart = Math.floor(Math.random() * (-sizePicture + 1620));
  const yEnd = Math.floor(Math.random() * (-sizePicture + 1620)) - sizePicture;

  let x = tweened(xStart, {
    duration: duration,
    easing: cubicOut
  });

  let y = tweened(yStart, {
    duration: duration,
    easing: cubicOut
  });

  onMount(() => {
    x.set(xEnd);
    y.set(yEnd);
  });

  const plant1 = plantsWithusers[0];
  const plant2 = plantsWithusers[1];
</script>

<div class="viewport bg-roel_rose">
  <div class="camera" style="transform: translateX({$x}px) translateY({$y}px);">
    <img src={plant1.plant.imageUrl} alt="Plant" class="target-image" />
    <img src={plant2.plant.imageUrl} alt="Plant" class="target-image" />
    <div
      class="absolute text-3xl text-roel_rose bg-roel_purple py-0.5 px-2"
      style="left: {540 / 2 - xEnd}px; top: {1620 / 2 -
        yEnd}px; transform: translate(-50%, -50%);"
    >
      {plant2.user.username}'s {plant2.plant.commonName}
    </div>
  </div>
</div>

<style>
  .viewport {
    width: 540px;
    height: 1620px;
    overflow: hidden;
    position: relative;
  }

  .camera {
    width: 3000px;
    height: 3000px;
    position: absolute;
  }

  .target-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>

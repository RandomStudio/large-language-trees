<script lang="ts">
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import type { PublicUserInfo, SelectPlant } from "$lib/types";

  export let plant: SelectPlant;
  export let user: PublicUserInfo;

  const sizePicture = 2000;
  const duration = 15000; //ms

  const xStart = Math.floor(Math.random() * (-sizePicture + 540));
  const xEnd = Math.floor(Math.random() * (-sizePicture + 540));
  const yStart = Math.floor(Math.random() * (-sizePicture + 1620));
  const yEnd = Math.floor(Math.random() * (-sizePicture + 1620));

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
</script>

<div class="viewport bg-roel_rose">
  <div class="camera" style="transform: translateX({$x}px) translateY({$y}px);">
    <img src={plant.imageUrl} alt="Plant" class="target-image" />
    <div
      class="absolute text-3xl text-roel_rose bg-roel_purple py-0.5 px-2 font-primer"
      style="left: {540 / 2 - xEnd}px; top: {1620 / 2 -
        yEnd}px; transform: translate(-50%, -50%);"
    >
      {user.username}'s {plant.commonName}
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
    width: 2000px;
    height: 2000px;
    position: absolute;
  }

  .target-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>

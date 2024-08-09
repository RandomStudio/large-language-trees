<script lang="ts">
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let plantsWithusers: { plant: SelectPlant; user: PublicUserInfo }[];

  const sizePicture = 2000;
  const duration = 15000; //ms

  // Fonctions pour générer les positions de départ et de fin aléatoires
  const randomPosition = () => Math.floor(Math.random() * (-sizePicture + 540));
  const randomOffset = () => Math.floor(Math.random() * (-sizePicture + 1620));

  // Initialisation pour plant1
  const xStart1 = randomPosition();
  const xEnd1 = randomPosition();
  const yStart1 = randomOffset();
  const yEnd1 = randomOffset();

  let x1 = tweened(xStart1, { duration, easing: cubicOut });
  let y1 = tweened(yStart1, { duration, easing: cubicOut });

  // Initialisation pour plant2
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

<div class="viewport bg-roel_rose">
  <div
    class="camera"
    style="transform: translateX({$x1}px) translateY({$y1}px);"
  >
    <img src={plant1.plant.imageUrl} alt="Plant" class="target-image" />
  </div>
  <div
    class="camera"
    style="transform: translateX({$x2}px) translateY({$y2}px);"
  >
    <img src={plant2.plant.imageUrl} alt="Plant" class="target-image" />
    <div
      class="absolute text-3xl text-roel_rose bg-roel_purple py-0.5 px-2 font-primer"
      style="left: {540 / 2 - xEnd2}px; top: {1620 / 2 -
        yEnd2}px; transform: translate(-50%, -50%);"
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

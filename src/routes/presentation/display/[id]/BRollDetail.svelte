<script lang="ts">
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import AnimatedPlant from "../../../../components/AnimatedPlant.svelte";

  export let plant: SelectPlant;
  export let user: PublicUserInfo;
  export let applyFilters: boolean = false;
  export let positionStyles: string = "w-full";

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

  const soundFiles = [
    "/Sound 1 - Schuup.mp3",
    "/Sound 2 - Dududu.mp3",
    "/Sound 3 - Whistles.mp3",
    "/Sound 4 - Schuup2.mp3",
    "/Sound 5 - Dududu2.mp3",
    "/Sound 6 - Ghost.mp3"
  ];

  function getRandomSoundFile() {
    const randomIndex = Math.floor(Math.random() * soundFiles.length);
    return soundFiles[randomIndex];
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="viewport w-screen h-screen bg-gradient-to-t from-roel_blue from-0% to-roel_rose to-100%"
  on:click={() => {
    console.log("SOUND ENABLED");
    const audio = new Audio(getRandomSoundFile());
    audio.play();
  }}
>
  <div class="camera" style="transform: translateX({$x}px) translateY({$y}px);">
    <div
      class="absolute text-5xl text-roel_rose bg-roel_purple py-[2vw] px-[2vw] font-primer top-[80vw] left-[80vw] text-center isolate"
    >
      {user.username}'s
      {plant.commonName}
    </div>
    <AnimatedPlant
      imageURL={plant.imageUrl || ""}
      {applyFilters}
      {positionStyles}
    />
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
  }

  .target-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>

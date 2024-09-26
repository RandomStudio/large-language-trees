<script lang="ts">
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import { onMount } from "svelte";
  import { tweened, type Tweened } from "svelte/motion";
  import { cubicIn, cubicOut } from "svelte/easing";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import { MULTI_DETAIL_TIMEOUT } from "$lib/constants";
  import { remap } from "@anselan/maprange";

  export let plantImages: string[];

  const sizePicture = window.innerWidth * 3;
  console.log({ sizePicture });

  const duration = MULTI_DETAIL_TIMEOUT * 1.5;
  const delayStart = duration / 4;

  interface ImageWithPosition {
    url: string;
    x: number;
    y: number;
  }

  let movingPlants: ImageWithPosition[] = plantImages.map((p, i) => ({
    url: p,
    x: i % 2 == 0 ? -sizePicture : sizePicture,
    y: i % 2 == 0 ? 0 : sizePicture / 2
  }));

  onMount(() => {
    setTimeout(() => {
      movingPlants = movingPlants.map((p, i) => ({
        ...p,
        x: remap(Math.random(), [0, 1], [-sizePicture / 2, sizePicture / 2]),
        y: remap(Math.random(), [0, 1], [sizePicture / 4, -sizePicture / 4])
      }));
    });
  });
</script>

<div class="w-full h-full presentation-gradient">
  <div class="w-screen h-screen overflow-hidden">
    {#each movingPlants as { url, x, y }, index}
      <div
        class="mix-blend-difference object-cover absolute"
        style:transition={`top ${Math.round(duration / 1000)}s ease-out ${index}s, left ${Math.round(duration / 1000)}s ease-out ${index * 2}s`}
        style:width={`${sizePicture}px`}
        style:height={`${sizePicture}px`}
        style:left={`${x}px`}
        style:top={`${y}px`}
      >
        <PlantDisplay imageUrl={url} applyFilters={false} />
      </div>
    {/each}
  </div>
</div>

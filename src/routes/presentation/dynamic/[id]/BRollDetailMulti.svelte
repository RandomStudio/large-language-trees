<script lang="ts">
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import { onMount } from "svelte";
  import { tweened, type Tweened } from "svelte/motion";
  import { cubicIn, cubicOut } from "svelte/easing";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import { MULTI_DETAIL_TIMEOUT } from "$lib/constants";

  export let plantsWithusers: { plant: SelectPlant; user: PublicUserInfo }[];

  const sizePicture = window.innerWidth * 3;
  console.log({ sizePicture });

  const duration = MULTI_DETAIL_TIMEOUT * 1.5;
  const delayStart = duration / 4;

  const xStartOdd = -sizePicture / 2.5;
  const xEndOdd = -sizePicture;
  const yStartOdd = sizePicture * 1.3;
  const yEndOdd = -sizePicture * 0.1;

  const xStartEven = xStartOdd / 2;
  const xEndEven = -xEndOdd;
  const yStartEven = yStartOdd;
  const yEndEven = yEndOdd;

  interface MovingPlant {
    plant: SelectPlant;
    user: PublicUserInfo;
    x: Tweened<number>;
    y: Tweened<number>;
  }

  let movingPlants: MovingPlant[] = plantsWithusers.map((p, i) => {
    const isEven = i % 2 === 0;
    return {
      plant: p.plant,
      user: p.user,
      x: tweened(isEven ? xStartEven : xStartOdd, {
        duration,
        easing: cubicIn,
        delay: delayStart * i
      }),
      y: tweened(isEven ? yStartEven : yStartOdd, {
        duration,
        easing: cubicIn,
        delay: delayStart * i
      })
    };
  });

  onMount(() => {
    movingPlants.forEach((p, i) => {
      const isEven = i % 2 === 0;

      p.x.set(isEven ? xEndEven : xEndOdd);
      p.y.set(isEven ? yEndEven : yEndOdd);
    });
  });
</script>

<div class="w-full h-full presentation-gradient">
  <div class="w-screen h-screen overflow-hidden">
    {#each movingPlants as { user, plant, x, y }}
      <div
        class="mix-blend-difference object-cover absolute"
        style:width={`${sizePicture}px`}
        style:height={`${sizePicture}px`}
        style:top={`${x.get()}`}
      >
        <div
          class="absolute text-5xl text-roel_rose bg-new_purple py-[2vw] px-[2vw] font-primer top-[80vw] right-[80vw] text-center"
        >
          {user.username}'s
          {plant.commonName}
        </div>
        <PlantDisplay imageUrl={plant.imageUrl || ""} applyFilters={false} />
      </div>
    {/each}
  </div>
</div>

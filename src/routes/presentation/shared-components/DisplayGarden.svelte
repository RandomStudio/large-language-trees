<script lang="ts">
  import type { GardenWithPlants, SelectPlant } from "$lib/types";
  import { remap } from "@anselan/maprange";
  import type { Position } from "postcss";
  import { beforeUpdate, onMount } from "svelte";

  export let garden: GardenWithPlants;
  export let width: number = 1000;
  export let height: number = width;
  export let showGardenName = true;
  export let showPlantName = false;
  export let colorBGText = "roel_green";

  const skewDegrees = 2;
  const animationLength = 6;
  const skewOffset = 5;

  let containerDiv: HTMLDivElement;

  // width = convertWidth(width, innerwidth);
  // height = convertHeight(height, innerheight);
  // xGarden = convertWidth(xGarden, width);
  // yGarden = convertHeight(yGarden, height);

  interface PositionData {
    x: number;
    y: number;
    size: number;
    zIndex: number;
  }

  interface PlantsWithPositions extends SelectPlant {
    plantPositionData: PositionData;
  }

  interface PlantsWithGrasses extends PlantsWithPositions {
    grassPositions: PositionData[];
  }

  let positions: PlantsWithGrasses[] = [];

  function findMinMaxHeight() {
    if (!garden.plants || garden.plants.length === 0) {
      return { min: 0, max: 0 };
    }

    let min = (garden.plants[0].properties as any).heightInMetres as number;
    let max = min;

    for (const plant of garden.plants) {
      const height = (plant.properties as any).heightInMetres;
      if (height < min) min = height;
      if (height > max) max = height;
    }

    return { min, max };
  }

  // function calculateProportionalSize(
  //   heightInMetres: number,
  //   minHeightPlant: number,
  //   maxHeightPlant: number,
  //   baseScale: number
  // ) {
  //   const heightRange = maxHeightPlant - minHeightPlant;
  //   const heightProportion = (heightInMetres - minHeightPlant) / heightRange;
  //   const proportionalSize = baseScale + heightProportion * baseScale;

  //   return proportionalSize;
  // }

  const positionAround = (
    x: number,
    y: number,
    maxDistance: number
  ): { x: number; y: number } => {
    const angle = Math.random() * 2 * Math.PI; // 360 degrees = 2PI Radians
    const distance = remap(Math.random(), [0, 1.0], [0, maxDistance]);
    return {
      x: x + distance * Math.cos(angle),
      y: y + distance * Math.sin(angle)
    };
  };

  const buildLayout = (plantsInGarden: SelectPlant[]): PlantsWithGrasses[] => {
    // const { min: minHeightPlant, max: maxHeightPlant } = findMinMaxHeight();
    const baseScale = 300;
    const size = baseScale;
    const radius = Math.min(width / 2, height / 2);

    console.log({ radius, size });

    return plantsInGarden.map((plant, index) => {
      const isOriginalPlant = plant.parent1 === null;

      const { x, y } = positionAround(
        width / 2,
        height / 2,
        isOriginalPlant
          ? 0
          : remap(index, [0, plantsInGarden.length], [0, radius])
      );
      console.log({ x, y });

      const plantPositionData = {
        x,
        y,
        size,
        zIndex: index * 100
      };
      return {
        ...plant,
        plantPositionData,
        grassPositions: grassAroundPlant(plantPositionData)
      };
    });
  };

  function grassAroundPlant(plantPositionData: PositionData): PositionData[] {
    const { size } = plantPositionData;
    const grassSize = size / 2;
    const maxDistance = grassSize / 3;

    const NUM_PATCHES = 4;

    let grassPatches = [];
    for (let i = 0; i < NUM_PATCHES; i++) {
      const { x, y } = positionAround(
        plantPositionData.x,
        plantPositionData.y,
        maxDistance
      );
      grassPatches.push({
        x,
        y: y + size / 2,
        size: grassSize,
        zIndex:
          i === 0 ? plantPositionData.zIndex + 1 : plantPositionData.zIndex - i
      });
    }

    console.log({ grassPatches });

    return grassPatches;
  }

  onMount(() => {
    positions = buildLayout(garden.plants);
  });
</script>

<div class="absolute" style:width={`${width}px`} style:height={`${height}px`}>
  {#each positions as { parent1, commonName, imageUrl, plantPositionData, grassPositions }}
    {#each grassPositions as grassPatch}
      <img
        src="/grassjess.png"
        alt="Grass"
        class="absolute opacity-90 skew-animated"
        style={`left: ${grassPatch.x - grassPatch.size / 2}px; top: ${grassPatch.y - grassPatch.size / 2}px; width: ${grassPatch.size}px; z-index: ${grassPatch.zIndex};transform:translate(-50%,-50%)`}
        style:--skew-animation-delay={(Math.random() * -animationLength) / 3 +
          "s"}
        style:--skew-animation-length={animationLength + "s"}
        style:--skew-degrees={skewDegrees + "deg"}
        style:--negative-skew-degrees={"-" + skewDegrees + "deg"}
        style:--skew-offset={skewOffset + "px"}
      />
    {/each}
    <img
      src={imageUrl}
      alt="Plant"
      class="absolute skew-animated"
      style={`left: ${plantPositionData.x - plantPositionData.size / 2}px; top: ${plantPositionData.y - plantPositionData.size / 2}px; width: ${plantPositionData.size}px; height: auto; z-index: ${plantPositionData.zIndex}; transform:translate(-50%,-50%)`}
      crossorigin="anonymous"
      style:--skew-animation-delay={(Math.random() * -animationLength) / 3 +
        "s"}
      style:--skew-animation-length={animationLength + "s"}
      style:--skew-degrees={skewDegrees + "deg"}
      style:--negative-skew-degrees={"-" + skewDegrees + "deg"}
      style:--skew-offset={skewOffset + "px"}
    />
    {#if parent1 == null && showGardenName}
      <div
        class="relative z-2000 font-primer text-5xl text-new_purple py-[2vw] px-[2vw] text-center bg-{colorBGText} scale-50"
      >
        {garden.name}
      </div>
    {:else if showPlantName}
      <div
        class="absolute z-2000 font-primer text-5xl text-new_purple py-[2vw] px-[2vw] text-center bg-{colorBGText}"
        style={`left: ${plantPositionData.x}px; top: ${plantPositionData.y + plantPositionData.size / 2}px; width: auto; height: auto; z-index:${plantPositionData.zIndex + 1}`}
      >
        {commonName}
      </div>
    {/if}
  {/each}
</div>

<style>
  @keyframes skew-animation {
    0% {
      transform: skew(var(--skew-degrees))
        translateX(calc(var(--skew-offset) * -1));
    }
    50% {
      transform: skew(var(--negative-skew-degrees))
        translateX(calc(var(--skew-offset) * 1));
    }
    100% {
      transform: skew(var(--skew-degrees))
        translateX(calc(var(--skew-offset) * -1));
    }
  }

  .skew-animated {
    animation:
      skew-animation var(--skew-animation-length) infinite
        var(--skew-animation-delay),
      birth-animation 2s ease-out;
  }
</style>

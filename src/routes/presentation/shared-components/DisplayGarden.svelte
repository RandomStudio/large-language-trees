<script lang="ts">
  import type { GardenWithPlants, SelectPlant } from "$lib/types";
  import { remap } from "@anselan/maprange";
  import type { Position } from "postcss";
  import { beforeUpdate, onMount } from "svelte";

  export let garden: GardenWithPlants;
  export let width: number = 1000;
  export let height: number = width;
  export let xGarden = 0;
  export let yGarden = 0;
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

  function buildLayout(plantsInGarden: SelectPlant[]): PlantsWithGrasses[] {
    // const { min: minHeightPlant, max: maxHeightPlant } = findMinMaxHeight();
    const baseScale = 300;
    const size = baseScale;
    const radius = Math.min(width / 2, height / 2);

    console.log({ radius, size });

    return plantsInGarden.map((plant, index) => {
      if (plant.parent1 === null) {
        const x = width / 2 - size / 2;
        const y = height / 2 - size / 2;
        const zIndex = Math.floor(height / 2); // TODO: this is so wrong
        const plantPositionData = {
          x,
          y,
          size,
          zIndex
        };
        return {
          ...plant,

          grassPositions: grassAroundPlant(plantPositionData)
        };
      } else {
        const angle = Math.random() * Math.PI * 2;
        const distance = remap(index, [0, plantsInGarden.length], [0, radius]);

        const x = width / 2 + distance * Math.cos(angle) - size / 2;
        const y = height / 2 + distance * Math.sin(angle) - size / 2;

        console.log({ x, y });

        const zIndex = Math.floor(y);
        const grasses = grassAroundPlant({ x, y, size, zIndex }, baseScale);
        return { ...plant, x, y, size, zIndex, grasses };
      }
    });
  }

  function randomizeSize(size: number, variationFactor: number) {
    return size * (1 + Math.random() * variationFactor - variationFactor);
  }

  function randomizePosition(center: number, maxDistance: number) {
    return center + (Math.random() * 2 - 1) * maxDistance;
  }

  function grassAroundPlant(plantPositionData: PositionData) {
    const { size, x, y } = plantPositionData;
    const baseSize = size * 0.5;
    const variationFactor = 0.2;
    const maxDistance = baseSize / 3;

    const grassPatches = [
      {
        x: plantPositionData.x * 1,
        y: plantPositionData.y + plantPositionData.size / 2.8 - 100,
        size: randomizeSize(baseSize, variationFactor),
        zIndexGrass: plantPositionData.zIndex + 0
      },
      {
        x: (plantPositionData.x - plantPositionData.size / 3) * 1,
        y: plantPositionData.y * 1.2,
        size: randomizeSize(baseSize, variationFactor),
        zIndexGrass: plantPositionData.zIndex
      },
      {
        x: plantPositionData.x * 1.3,
        y: plantPositionData.y * 1.2 - plantPositionData.size / 4,
        size: randomizeSize(baseSize, variationFactor),
        zIndexGrass: plantPositionData.zIndex
      },
      {
        x: (plantPositionData.x + plantPositionData.size / 3) * 1,
        y: plantPositionData.y * 1.2,
        size: randomizeSize(baseSize, variationFactor),
        zIndexGrass: plantPositionData.zIndex + 1000
      },
      {
        x: randomizePosition(plantPositionData.x * 1, maxDistance),
        y: randomizePosition(plantPositionData.y * 1.2, maxDistance),
        size: randomizeSize(baseSize, variationFactor),
        zIndexGrass: plantPositionData.zIndex
      }
    ];

    return grassPatches;
  }

  onMount(() => {
    positions = buildLayout(garden.plants);
  });
</script>

<div class="absolute" style:width={`${width}px`} style:height={`${height}px`}>
  {#each positions as { parent1, commonName, imageUrl, x, y, size, zIndex, grasses }}
    {#each grasses as grass}
      <img
        src="/grassjess.png"
        alt="Grass"
        class="absolute opacity-90 skew-animated"
        style={`left: ${grass.x}px; top: ${grass.y}px; width: ${grass.size}px; z-index: ${grass.zIndexGrass - 100};transform:translate(-50%,-50%)`}
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
      style={`left: ${x}px; top: ${y}px; width: ${size}px; height: auto; z-index: ${zIndex}; transform:translate(-50%,-50%)`}
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
        class="absolute z-2000 font-primer text-5xl text-new_purple py-[2vw] px-[2vw] text-center bg-{colorBGText} scale-50"
        style={`left: ${x - 120}px; top: ${y + size / 2}px; width: auto; height: auto; z-index:2000`}
      >
        {garden.name}
      </div>
    {:else if showPlantName}
      <div
        class="absolute z-2000 font-primer text-5xl text-new_purple py-[2vw] px-[2vw] text-center bg-{colorBGText}"
        style={`left: ${x - 120}px; top: ${y + size / 2}px; width: auto; height: auto; z-index:${zIndex + 1}`}
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

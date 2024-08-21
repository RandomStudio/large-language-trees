<script lang="ts">
  import type { GardenWithPlants, SelectPlant } from "$lib/types";
  import { beforeUpdate } from "svelte";

  export let garden: GardenWithPlants;
  export let width = 1000;
  export let height = 1000;
  export let xGarden = 500;
  export let yGarden = 200;
  export let showGardenName = true;
  export let showPlantName = false;
  export let colorBGText = "roel_green";
  export let innerwidth: number = 540;
  export let innerheight: number = 1620;

  const previousHeight = 1620;
  const previousWidth = 540;

  const skewDegrees = 6;
  const animationLength = 6;
  const skewOffset = 20;

  width = convertWidth(width, innerwidth);
  height = convertHeight(height, innerheight);
  xGarden = convertWidth(xGarden, innerwidth);
  yGarden = convertHeight(yGarden, innerheight);

  let plantProportion = 0.6;
  let positions: PlantPosition[];

  function convertHeight(y: number, innerheight: number) {
    return (y * innerheight) / previousHeight;
  }

  function convertWidth(x: number, innerwidth: number) {
    return (x * innerwidth) / previousWidth;
  }

  function findMinMaxHeight() {
    if (!garden.plantsInGarden || garden.plantsInGarden.length === 0) {
      return { min: 0, max: 0 };
    }

    let min = (garden.plantsInGarden[0].properties as any)
      .heightInMetres as number;
    let max = min;

    for (const plant of garden.plantsInGarden) {
      const height = (plant.properties as any).heightInMetres;
      if (height < min) min = height;
      if (height > max) max = height;
    }

    return { min, max };
  }

  function calculateProportionalSize(
    heightInMetres: number,
    minHeightPlant: number,
    maxHeightPlant: number,
    minSizePlant: number,
    maxSizePlant: number
  ) {
    const heightRange = maxHeightPlant - minHeightPlant;
    const sizeRange = maxSizePlant - minSizePlant;
    const heightProportion = (heightInMetres - minHeightPlant) / heightRange;

    const proportionalSize = minSizePlant + heightProportion * sizeRange;

    return proportionalSize;
  }

  interface PlantPosition extends SelectPlant {
    x: number;
    y: number;
    size: number;
    zIndex: number;
    grasses: {
      x: number;
      y: number;
      size: number;
      zIndexGrass: number;
    }[];
  }

  function randomizePositions(plantsInGarden: SelectPlant[]): PlantPosition[] {
    let averageSizePlant = Math.floor(
      Math.sqrt(
        (plantProportion * height * width) / garden.plantsInGarden.length
      )
    );
    let maxHeightPlant = findMinMaxHeight().max;
    let minHeightPlant = findMinMaxHeight().min;
    let maxSizePlant = averageSizePlant * 1.35;
    let minSizePlant = averageSizePlant * 0.65;
    let radius = Math.min(width / 2, height / 2);
    return plantsInGarden.map((plant, index) => {
      if (plant.parent1 === null) {
        return {
          ...plant,
          x: width / 2,
          y: height / 2,
          size:
            Math.floor(
              calculateProportionalSize(
                (plant.properties as any).heightInMetres,
                minHeightPlant,
                maxHeightPlant,
                minSizePlant,
                maxSizePlant
              )
            ) || averageSizePlant,
          zIndex: Math.floor(height / 2),
          grasses: grassAroundMain(
            {
              x: width / 2,
              y: height / 2,
              size: averageSizePlant,
              zIndex: Math.floor(height / 2)
            },
            averageSizePlant
          )
        };
      } else {
        const angle = Math.random() * Math.PI * 2;
        const distance = ((index + 1) / plantsInGarden.length) * radius;

        const x = width / 2 + distance * Math.cos(angle);
        const y = height / 2 + distance * Math.sin(angle);

        const size =
          Math.floor(
            calculateProportionalSize(
              (plant.properties as any).heightInMetres,
              minHeightPlant,
              maxHeightPlant,
              minSizePlant,
              maxSizePlant
            )
          ) || averageSizePlant;

        const zIndex = Math.floor(y);
        const grasses = grassAroundMain(
          { x, y, size, zIndex },
          averageSizePlant
        );
        return { ...plant, x, y, size, zIndex, grasses };
      }
    });
  }

  function grassAroundMain(
    position: {
      x: number;
      y: number;
      size: number;
      zIndex: number;
    },
    averageSizePlant: number
  ) {
    const baseSize = averageSizePlant * 0.6;
    const variationFactor = 0.2;
    const maxDistance = position.size / 3;

    function randomizeSize(size: number) {
      return size * (1 + Math.random() * 1 * variationFactor - variationFactor);
    }

    function randomizePosition(center: number) {
      return center + (Math.random() * 2 - 1) * maxDistance;
    }

    const grassPatches = [
      {
        x: position.x,
        y: position.y + position.size / 3,
        size: randomizeSize(baseSize),
        zIndexGrass: position.zIndex + 1
      },
      {
        x: position.x - position.size / 3,
        y: position.y,
        size: randomizeSize(baseSize),
        zIndexGrass: position.zIndex
      },
      {
        x: position.x,
        y: position.y - position.size / 4,
        size: randomizeSize(baseSize),
        zIndexGrass: position.zIndex
      },
      {
        x: position.x + position.size / 3,
        y: position.y,
        size: randomizeSize(baseSize),
        zIndexGrass: position.zIndex
      },
      {
        x: randomizePosition(position.x),
        y: randomizePosition(position.y),
        size: randomizeSize(baseSize),
        zIndexGrass: position.zIndex
      }
    ];

    return grassPatches;
  }

  beforeUpdate(() => {
    positions = randomizePositions(garden.plantsInGarden);
  });
</script>

<div
  class="fixed border-black border-[0px]"
  style="width: {width}px; height: {height}px; position: absolute; left: {xGarden}px; top: {yGarden}px; "
>
  {#each positions as { parent1, commonName, imageUrl, x, y, size, zIndex, grasses }}
    {#each grasses as grass}
      <img
        src="/grassjess.png"
        alt="Grass"
        class="absolute opacity-90 skew-animated"
        style={`left: ${grass.x}px; top: ${grass.y}px; width: ${grass.size}px; z-index: ${grass.zIndexGrass};transform:translate(-50%,-50%)`}
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
        class="absolute z-2000 font-primer text-5xl text-roel_purple py-[2vw] px-[2vw] text-center bg-{colorBGText}"
        style={`left: ${x - 120}px; top: ${y + size / 2}px; width: auto; height: auto; z-index:2000`}
      >
        {garden.name}
      </div>
    {:else if showPlantName}
      <div
        class="absolute z-2000 font-primer text-5xl text-roel_purple py-[2vw] px-[2vw] text-center bg-{colorBGText}"
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

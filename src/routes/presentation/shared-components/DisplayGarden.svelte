<script lang="ts">
  import type {
    GardenWithPlants,
    PlantProperties,
    SelectPlant
  } from "$lib/types";
  import { remap } from "@anselan/maprange";
  import { beforeUpdate } from "svelte";

  export let garden: GardenWithPlants;
  export let width: number = 1000;
  export let height: number = width;
  export let showGardenName = true;
  export let showPlantName = false;
  export let colorBGText = "roel_green";

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

  const stringOrNumberToNumber = (x: number | string): number => {
    if (typeof x === "number") {
      return x;
    } else if (typeof x === "string") {
      try {
        const n = parseFloat(x);
        return n;
      } catch (e) {
        console.error("failed to parse", x, "as float number");
        return 1;
      }
    } else {
      console.error("value is neither number nor string");
      return 1;
    }
  };

  const getLargestPlantHeightMetres = (plants: SelectPlant[]) =>
    plants.map((p) => getPlantHeightMetres(p)).sort((a, b) => b - a)[0];

  const getPlantHeightMetres = (plant: SelectPlant) => {
    const { heightInMetres } = plant.properties as PlantProperties;
    const h = stringOrNumberToNumber(heightInMetres);
    // console.log(plant.commonName, "height in metres", h);
    return h;
  };

  const positionAround = (
    x: number,
    y: number,
    maxDistance: number
  ): { x: number; y: number } => {
    const angle = Math.random() * 2 * Math.PI; // 360 degrees = 2PI Radians
    // const distance = remap(Math.random(), [0, 1.0], [0, maxDistance]);
    const distance = maxDistance;
    // console.log({ angle, distance });
    return {
      x: x + distance * Math.cos(angle),
      y: y + distance * Math.sin(angle)
    };
  };

  const grassAroundPlant = (
    plantPositionData: PositionData,
    maxPatches: number = 4
  ): PositionData[] => {
    const grassSize = height / 10;

    const startX = plantPositionData.x + plantPositionData.size / 2;
    const startY = plantPositionData.y + plantPositionData.size;

    const numPatches = Math.ceil(Math.random() * maxPatches);

    let grassPatches = [];
    for (let i = 0; i < numPatches; i++) {
      const offsetX =
        i === 0 ? 0 : (Math.random() * plantPositionData.size) / 2;

      const offsetY = (Math.random() * plantPositionData.size) / 4;

      const offsetSize = (Math.random() * height) / 10;

      const size = grassSize - offsetSize;

      grassPatches.push({
        x:
          i % 2 === 0
            ? startX + offsetX - size / 2
            : startX - offsetX - size / 2,
        y: startY - size / 2 - offsetY,
        size,
        zIndex: i === 0 && numPatches < 2 ? plantPositionData.zIndex + 1 : 1
      });
    }
    // console.log({ grassPatches });
    return grassPatches;
  };

  const buildLayout = (plantsInGarden: SelectPlant[]): PlantsWithGrasses[] => {
    // const { min: minHeightPlant, max: maxHeightPlant } = findMinMaxHeight();
    const tallestPlantMetres = getLargestPlantHeightMetres(plantsInGarden);
    // console.log({ tallestPlantMetres });

    /** "Pushes" the centre of the offset curve later/lower as the number increases */
    const OFFSET_CENTRE_FACTOR = 1.5;

    return plantsInGarden
      .sort((a, b) => {
        const hA = getPlantHeightMetres(a);
        const hB = getPlantHeightMetres(b);
        return hB - hA;
      })
      .map((plant, index) => {
        const sizePixels = remap(
          getPlantHeightMetres(plant),
          [0.1, tallestPlantMetres],
          [width / 4, width],
          true,
          true
        );

        const offsetY = remap(
          index * OFFSET_CENTRE_FACTOR,
          [0, plantsInGarden.length - 1],
          [sizePixels / 2, height - sizePixels / 2],
          true
        );

        const amplitudeX =
          index === 0
            ? 0
            : remap(index, [1, plantsInGarden.length - 1], [width / 2, 0]) *
              Math.random();

        const offsetX = index % 2 === 0 ? -amplitudeX : amplitudeX;
        const plantPositionData = {
          x: width / 2 - sizePixels / 2 + offsetX,
          y: index === 0 ? 0 : offsetY - sizePixels / 2,
          size: sizePixels,
          zIndex: (index + 1) * 100
        };
        // console.log({
        //   index,
        //   plant: plant.commonName,
        //   sizePixels,
        //   plantPositionData
        // });

        const numPatches = remap(
          index,
          [0, plantsInGarden.length - 1],
          [32, 0],
          true,
          true
        );

        return {
          ...plant,
          plantPositionData,
          grassPositions: grassAroundPlant(plantPositionData, numPatches)
        };
      });
  };

  beforeUpdate(() => {
    console.log("..................... buildLayout!");
    positions = buildLayout(garden.plants);
  });
</script>

<div class="absolute" style:width={`${width}px`} style:height={`${height}px`}>
  {#each positions as { parent1, commonName, imageUrl, plantPositionData, grassPositions }}
    {#each grassPositions as grassPatch}
      <img
        src="/grassjess.png"
        class="absolute opacity-90 skew-animated"
        style={`left: ${grassPatch.x}px; top: ${grassPatch.y}px; width: ${grassPatch.size}px; z-index: ${grassPatch.zIndex};`}
        alt={`Grass for ${commonName}`}
      />
    {/each}
    <img
      src={imageUrl}
      alt={commonName}
      class="absolute skew-animated"
      style={`left: ${plantPositionData.x}px; top: ${plantPositionData.y}px; width: ${plantPositionData.size}px; height: auto; z-index: ${plantPositionData.zIndex}; transition: left 2s, top 5s;`}
      crossorigin="anonymous"
    />
    {#if showPlantName}
      <div
        class="absolute z-2000 font-primer text-5xl text-new_purple py-[2vw] px-[2vw] text-center bg-{colorBGText}"
        style={`left: ${plantPositionData.x}px; top: ${plantPositionData.y + plantPositionData.size / 2}px; width: auto; height: auto; z-index:${plantPositionData.zIndex + 1}`}
      >
        {commonName}
      </div>
    {/if}
  {/each}
</div>
{#if showGardenName}
  <div
    class="absolute z-[2000] font-primer text-5xl text-new_purple py-[2vw] px-[2vw] text-center bg-{colorBGText} scale-50"
  >
    {garden.name}
  </div>
{/if}

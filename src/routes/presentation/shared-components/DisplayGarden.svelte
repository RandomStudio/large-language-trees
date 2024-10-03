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

        // Offset from centre, as determined by index
        const amplitudeX =
          index === 0
            ? 0
            : remap(index, [1, plantsInGarden.length - 1], [width / 2, 0]) *
              Math.random();

        // Compress (horizontally and vertically) up to 10 plants
        const scaleByCount = remap(
          plantsInGarden.length,
          [0, 10],
          [0.1, 1.0],
          true
        );

        const scaledAmplitudeX = amplitudeX * scaleByCount;
        const scaledOffsetY = Math.max(offsetY * scaleByCount, sizePixels / 2);

        console.log({
          offsetY,
          sizePixels,
          scaleByNumber: scaleByCount,
          scaledAmplitudeX,
          scaledOffsetY,
          finalY: scaledOffsetY - sizePixels / 2
        });

        const offsetX = index % 2 === 0 ? -scaledAmplitudeX : scaledAmplitudeX;
        const plantPositionData = {
          x: width / 2 - sizePixels / 2 + offsetX,
          y: index === 0 ? 0 : scaledOffsetY - sizePixels / 2,
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

<div
  style:width={`${width}px`}
  style:height={`${height}px`}
  class="block relative"
>
  {#each positions as { parent1, commonName, imageUrl, plantPositionData, grassPositions }}
    {#each grassPositions as grassPatch}
      <img
        src="/grassjess.png"
        class="absolute opacity-90 skew-animated"
        style={`left: ${grassPatch.x}px; top: ${grassPatch.y}px; width: ${grassPatch.size}px; z-index: ${grassPatch.zIndex}; transition: left 2s, top 5s;`}
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
        class="absolute z-2000 font-primer text-5xl text-roel_purple py-[2vw] px-[2vw] text-center bg-{colorBGText}"
        style={`left: ${plantPositionData.x}px; top: ${plantPositionData.y + plantPositionData.size / 2}px; width: auto; height: auto; z-index:${plantPositionData.zIndex + 1}`}
      >
        {commonName}
      </div>
    {/if}
  {/each}
  {#if showGardenName}
    <div class="h-full flex flex-col items-center justify-center">
      <div
        class="absolute z-[2000] font-primer text-5xl text-roel_purple py-[2vw] px-[2vw] text-center bg-{colorBGText} scale-50 bottom-[25%]"
      >
        {garden.name}
      </div>
    </div>
  {/if}
</div>

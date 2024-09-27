<script lang="ts">
  import type {
    GardenWithPlants,
    PlantProperties,
    SelectPlant
  } from "$lib/types";
  import { remap } from "@anselan/maprange";
  import { DateTime } from "luxon";
  import { beforeUpdate } from "svelte";

  interface PlantImageWithDates {
    plantId: string;
    imageUrl: string | null;
    gardenId: string;
    timestamp: Date;
  }

  export let plants: PlantImageWithDates[];
  export let width: number = 1000;
  export let height: number = width;

  interface PositionData {
    x: number;
    y: number;
    size: number;
    zIndex: number;
  }

  interface PlantsWithPositions extends PlantImageWithDates {
    plantPositionData: PositionData;
  }

  interface PlantsWithGrasses extends PlantsWithPositions {
    grassPositions: PositionData[];
  }

  let positions: PlantsWithGrasses[] = [];

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

  const buildLayout = (plants: PlantImageWithDates[]): PlantsWithGrasses[] => {
    // const { min: minHeightPlant, max: maxHeightPlant } = findMinMaxHeight();
    // const tallestPlantMetres = getLargestPlantHeightMetres(plantsInGarden);
    // console.log({ tallestPlantMetres });

    /** "Pushes" the centre of the offset curve later/lower as the number increases */
    const OFFSET_CENTRE_FACTOR = 1.5;

    return plants
      .sort((a, b) => {
        const dateA = DateTime.fromJSDate(a.timestamp);
        const dateB = DateTime.fromJSDate(b.timestamp);
        const diff = dateA.diff(dateB);
        return diff.as("seconds");
      })
      .map((plant, index) => {
        const sizePixels = remap(
          index,
          [0, plants.length],
          [width / 4, width],
          true,
          true
        );

        const offsetY = remap(
          index * OFFSET_CENTRE_FACTOR,
          [0, plants.length - 1],
          [sizePixels / 2, height - sizePixels / 2],
          true
        );

        // Offset from centre, as determined by index
        const amplitudeX =
          index === 0
            ? 0
            : remap(index, [1, plants.length - 1], [width / 2, 0]) *
              Math.random();

        // Compress (horizontally and vertically) up to 10 plants
        const scaleByCount = remap(plants.length, [0, 10], [0.1, 1.0], true);

        const scaledAmplitudeX = amplitudeX * scaleByCount;
        const scaledOffsetY = offsetY * scaleByCount;

        console.log({ scaleByNumber: scaleByCount, scaledAmplitudeX });

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
          [0, plants.length - 1],
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
    positions = buildLayout(plants);
  });
</script>

<div class="absolute" style:width={`${width}px`} style:height={`${height}px`}>
  {#each positions as { imageUrl, plantPositionData, grassPositions }}
    {#each grassPositions as grassPatch}
      <img
        src="/grassjess.png"
        class="absolute opacity-90 skew-animated"
        style={`left: ${grassPatch.x}px; top: ${grassPatch.y}px; width: ${grassPatch.size}px; z-index: ${grassPatch.zIndex}; transition: left 2s, top 5s;`}
        alt={`Grass`}
      />
    {/each}
    <img
      src={imageUrl}
      alt={"actual plant"}
      class="absolute skew-animated"
      style={`left: ${plantPositionData.x}px; top: ${plantPositionData.y}px; width: ${plantPositionData.size}px; height: auto; z-index: ${plantPositionData.zIndex}; transition: left 2s, top 5s;`}
      crossorigin="anonymous"
    />
  {/each}
</div>

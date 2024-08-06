<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";

  export let garden: GardenWithPlants;
  export let width = 1000;
  export let height = 1000;
  export let xGarden = 500;
  export let yGarden = 200;
  export let showGardenName = true;

  let plantProportion = 0.7;
  let averageSizePlant = Math.floor(
    Math.sqrt((plantProportion * height * width) / garden.plantsInGarden.length)
  );

  let maxSizePlant = averageSizePlant * 1.25;
  let minSizePlant = averageSizePlant * 0.75;

  function findMinMaxHeight() {
    if (!garden.plantsInGarden || garden.plantsInGarden.length === 0) {
      return { min: 0, max: 0 };
    }

    let min = garden.plantsInGarden[0].plant.properties.heightInMetres;
    let max = min;

    for (const plant of garden.plantsInGarden) {
      const height = plant.plant.properties.heightInMetres;
      if (height < min) min = height;
      if (height > max) max = height;
    }

    return { min, max };
  }

  let maxHeightPlant = findMinMaxHeight().max;
  let minHeightPlant = findMinMaxHeight().min;

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

  let positions: {
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
  }[] = [];

  function randomizePositions() {
    positions = garden.plantsInGarden.map((plant) => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size =
        calculateProportionalSize(
          plant.plant.properties.heightInMetres,
          minHeightPlant,
          maxHeightPlant,
          minSizePlant,
          maxSizePlant
        ) || averageSizePlant;
      const zIndex = Math.floor(y); // Assurez-vous que c'est un entier
      const grasses = grassAroundMain({ x, y, zIndex });
      return { x, y, size, zIndex, grasses };
    });
  }

  function grassAroundMain(position: { x: number; y: number; zIndex: number }) {
    const size = 45;
    return [
      {
        x: position.x + 25,
        y: position.y + 60,
        size,
        zIndexGrass: position.zIndex + 1
      },
      {
        x: position.x + 25,
        y: position.y + 10,
        size,
        zIndexGrass: position.zIndex
      },
      {
        x: position.x,
        y: position.y + 40,
        size,
        zIndexGrass: position.zIndex
      },
      {
        x: position.x + 50,
        y: position.y + 40,
        size,
        zIndexGrass: position.zIndex
      }
    ];
  }

  randomizePositions();
</script>

<div
  class="fixed border-4 border-black"
  style="width: {width}px; height: {height}px; position: absolute; left: {xGarden}px; top: {yGarden}px; "
>
  {#each positions as { x, y, size, zIndex, grasses }, index}
    {#each grasses as grass}
      <img
        src="/grassjess.png"
        alt="Grass"
        class="absolute"
        style={`left: ${grass.x}px; top: ${grass.y}px; width: ${grass.size}px; z-index: ${grass.zIndexGrass};`}
      />
    {/each}
    <img
      src={garden.plantsInGarden[index].plant.imageUrl}
      alt="Plant"
      class="absolute"
      style={`left: ${x}px; top: ${y}px; width: ${size}px; height: auto; z-index: ${zIndex}; transform: translate(-50%, -50%)`}
    />
    {#if garden.plantsInGarden[index].plant.parent1 == null && showGardenName}
      <div
        class=" absolute font-primer text-2xl text-roel_purple px-2 py-1 bg-roel_green text-center"
        style={`left: ${x}px; top: ${y + 80}px; width: 120px; height: auto; z-index: ${zIndex + 1};`}
      >
        {garden.name}
        {size}px
      </div>
    {/if}
  {/each}
</div>

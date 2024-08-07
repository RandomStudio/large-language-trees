<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";

  export let garden: GardenWithPlants;
  export let width = 1000;
  export let height = 1000;
  export let xGarden = 500;
  export let yGarden = 200;
  export let showGardenName = true;
  export let showPlantName = false;
  export let colorBGText = "roel_green";

  let plantProportion = 0.6;
  let averageSizePlant = Math.floor(
    Math.sqrt((plantProportion * height * width) / garden.plantsInGarden.length)
  );

  let maxSizePlant = averageSizePlant * 1.35;
  let minSizePlant = averageSizePlant * 0.65;

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

  const radius = Math.min(width / 2, height / 2);

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
    const centralPlant = garden.plantsInGarden.find(
      (plant) => plant.plant.parent1 === null
    );

    positions = centralPlant
      ? [
          {
            x: width / 2,
            y: height / 2,
            size:
              Math.floor(
                calculateProportionalSize(
                  centralPlant.plant.properties.heightInMetres,
                  minHeightPlant,
                  maxHeightPlant,
                  minSizePlant,
                  maxSizePlant
                )
              ) || averageSizePlant,
            zIndex: Math.floor(height / 2),
            grasses: grassAroundMain({
              x: width / 2,
              y: height / 2,
              size: averageSizePlant,
              zIndex: Math.floor(height / 2)
            })
          }
        ]
      : [];

    const otherPlants = garden.plantsInGarden.filter(
      (plant) => plant !== centralPlant
    );

    otherPlants.forEach((plant, index) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = ((index + 1) / otherPlants.length) * radius;

      const x = width / 2 + distance * Math.cos(angle);
      const y = height / 2 + distance * Math.sin(angle);

      const size =
        Math.floor(
          calculateProportionalSize(
            plant.plant.properties.heightInMetres,
            minHeightPlant,
            maxHeightPlant,
            minSizePlant,
            maxSizePlant
          )
        ) || averageSizePlant;

      const zIndex = Math.floor(y);
      const grasses = grassAroundMain({ x, y, size, zIndex });

      positions.push({ x, y, size, zIndex, grasses });
    });
  }

  function grassAroundMain(position: {
    x: number;
    y: number;
    size: number;
    zIndex: number;
  }) {
    const baseSize = averageSizePlant * 0.6;
    const variationFactor = 0.2;
    const maxDistance = position.size / 3;

    function randomizeSize(size: number) {
      return size * (1 + Math.random() * 2 * variationFactor - variationFactor);
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
        style={`left: ${grass.x}px; top: ${grass.y}px; width: ${grass.size}px; z-index: ${grass.zIndexGrass};transform:translate(-50%,-50%)`}
      />
    {/each}
    <img
      src={garden.plantsInGarden[index].plant.imageUrl}
      alt="Plant"
      class="absolute"
      style={`left: ${x}px; top: ${y}px; width: ${size}px; height: auto; z-index: ${zIndex}; transform:translate(-50%,-50%)`}
    />
    {#if garden.plantsInGarden[index].plant.parent1 == null && showGardenName}
      <div
        class="absolute font-primer text-2xl text-roel_purple px-2 py-0.5 text-center bg-{colorBGText}"
        style={`left: ${x - 60}px; top: ${y + size / 2}px; width: auto; height: auto; z-index:2000`}
      >
        {garden.name}
      </div>
    {:else if showPlantName}
      <div
        class="absolute font-primer text-2xl text-roel_purple px-2 py-0.5 text-center bg-{colorBGText}"
        style={`left: ${x - 60}px; top: ${y + size / 2}px; width: auto; height: auto; z-index:${zIndex + 1}`}
      >
        {garden.plantsInGarden[index].plant.commonName}
      </div>
    {/if}
  {/each}
</div>

<script lang="ts">
  import type {
    GardenPlantEntryWithPlant,
    GardenViewData,
    PlantProperties,
    SelectPlant,
  } from "$lib/types";
  export let data: GardenViewData;

  //constants relating to making plants not overlap
  const initialCrowdednessTolerance = 250;

  //plant min and max size on screen
  const minPlantHeightOutput = 75;
  const maxPlantHeightOutput = 200;
  const animationLength = 8;

  //display size and borders
  const monitorWidth = 1920;
  const monitorHeight = 1080;
  const frameSize = 150; //general border around all edges
  const topBorder = 75; // extra border on top

  //distribution on screen and size of plants in database
  const rootScale = 2;
  const tallestPlant = 30;
  const smallestPlant = 0.1;
  const minPlantHeight = Math.pow(smallestPlant, 1 / rootScale);
  const maxPlantHeight = Math.pow(tallestPlant, 1 / rootScale);
  const randomnessY = 20; // random displacement in y direction

  //constants relating to remap function
  const low2 = 0;
  const high2 = 1;

  interface PositionedPlant {
    plant: SelectPlant;
    x: number;
    y: number;
  }

  let displayPlants: PositionedPlant[] = [];

  if (data && data.garden && data.garden.plantsInGarden) {
    data.garden.plantsInGarden.forEach((entry) => {
      if (entry && entry.plant) {
        if (entry.plant.parent1 === null) {
          const newPositionedPlant: PositionedPlant = {
            plant: entry.plant,
            x: parentX(entry.plant),
            y: parentY(entry.plant),
          };
          displayPlants.push(newPositionedPlant); // adds plant to list if its a parent
        } else {
          const newPositionedPlant: PositionedPlant = {
            plant: entry.plant,
            x: childX(entry.plant),
            y: childY(entry.plant),
          };
          displayPlants.push(newPositionedPlant); // adds plant to list if its a child
        }
      }
    });
  }
  function parentX(plant: SelectPlant) {
    let proposedX = 0;
    let spaceOk = false;
    let tolerance = initialCrowdednessTolerance;

    while (!spaceOk) {
      proposedX = frameSize + Math.random() * (monitorWidth - frameSize * 2);
      spaceOk = checkIfSpaceIsOk(plant, proposedX, tolerance);
      tolerance -= 1;
      console.log(tolerance);
    }
    return proposedX;
  }

  function parentY(plant: SelectPlant) {
    return (
      frameSize +
      topBorder +
      maxPlantHeightOutput +
      (monitorHeight - minPlantHeightOutput * 2 - frameSize * 2 - topBorder) *
        (1 - // one minus remapped value in order to make the plants go from small to big
          remapPlantHeight(
            Math.log(rootScaleFromPlantHeight(plant)) + 1,
            Math.log(minPlantHeight) + 1,
            Math.log(maxPlantHeight) + 1,
          ))
    );
  }

  function childX(plant: SelectPlant) {
    return 100;
  }
  function childY(plant: SelectPlant) {
    return 100;
  }

  function checkIfSpaceIsOk(
    plant: SelectPlant,
    proposedX: number,
    tolerance: number,
  ) {
    let distanceList = [];
    for (let i = 0; i < displayPlants.length; i++) {
      let distance = calculateDistance(plant, proposedX, displayPlants[i]);
      distanceList.push(distance);
    }
    return Math.min(...distanceList) >= tolerance;
  }

  function calculateDistance(
    plant: SelectPlant,
    proposedX: number,
    displayPlants: PositionedPlant,
  ): number {
    let plantX = proposedX;
    let plantY = parentY(plant);

    let deltaX = plantX - displayPlants.x;
    let deltaY = plantY - displayPlants.y;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  // function to scale plant by property height
  function scaleFunction(plant: SelectPlant) {
    return (
      minPlantHeightOutput +
      remapPlantHeight(
        rootScaleFromPlantHeight(plant),
        minPlantHeight,
        maxPlantHeight,
      ) *
        (maxPlantHeightOutput - minPlantHeightOutput)
    );
  }

  // function to get property height from a plant, since it's reused
  function plantHeight(plant: SelectPlant): number {
    return (plant.properties as PlantProperties)["high(m)"] as number;
  }

  // function to give give plant z-index
  function zIndexFunction(plant: SelectPlant) {
    return 3000 - plantHeight(plant) * 100;
  }

  // remap plant height to 0 -> 1
  function remapPlantHeight(value: any, lowIn: any, highIn: any) {
    return low2 + ((high2 - low2) * (value - lowIn)) / (highIn - lowIn);
  }

  function rootScaleFromPlantHeight(plant: SelectPlant): number {
    return Math.max(
      smallestPlant,
      Math.min(Math.pow(plantHeight(plant), 1 / rootScale), tallestPlant),
    );
  }

  function randomAnimationDelay(): number {
    return (Math.random() * -animationLength) / 3;
  }
  let alt = "alt placeholder";
</script>

<body>
  <div id="container" class="fixed top-0 left-0 w-screen h-screen">
    {#each displayPlants as plant}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <img
        src={plant.plant.imageUrl}
        {alt}
        class="fixed skew-animated"
        style:margin-left={plant.x - scaleFunction(plant.plant) / 2 + "px"}
        style:margin-top={plant.y - scaleFunction(plant.plant) + "px"}
        style:width={scaleFunction(plant.plant) + "px"}
        style:z-index={zIndexFunction(plant.plant)}
        style:animation-duration={animationLength + "s"}
        style:animation-delay={randomAnimationDelay() + "s"}
      />
    {/each}
  </div>
</body>

<style>
  @keyframes skew-animation {
    0% {
      transform: skew(4deg);
      left: -7px;
    }
    50% {
      transform: skew(-4deg);
      left: 7px;
    }
    100% {
      transform: skew(4deg);
      left: -7px;
    }
  }

  .skew-animated {
    animation: skew-animation infinite;
  }
</style>

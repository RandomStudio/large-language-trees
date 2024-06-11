<script lang="ts">
  import type {
    GardenPlantEntryWithPlant,
    GardenViewData,
    PlantProperties
  } from "$lib/types";
  import { onMount } from "svelte";

  export let data: GardenViewData;

  let alt = "alt placeholder";

  //distribution on screen and size of plants in database
  const rootScale = 2; //maths root not plant roots lol
  const minPlantHeight = Math.pow(0.1, 1 / rootScale);
  const maxPlantHeight = Math.pow(30, 1 / rootScale);
  const randomnessY = 20; // random displacement in y direction

  // Plant min and max size on screen
  const minPlantHeightOutput = 75;
  const maxPlantHeightOutput = 200;
  const animationLength = 8;
  const animationDegree = 5;

  // Display size and borders
  const monitorWidth = 1920;
  const monitorHeight = 1080;
  const frameSize = 150; //general border around all edges
  const topBorder = 75; // extra border on top
  const yDistribution = 20; //size of patches in Y-dimension
  const xDistribution = 15; //size of patches in X-dimension

  //distribution on screen and size of plants in database
  const rootScale = 2;
  const tallestPlant = 30;
  const smallestPlant = 0.1;
  const minPlantHeight = Math.pow(smallestPlant, 1 / rootScale);
  const maxPlantHeight = Math.pow(tallestPlant, 1 / rootScale);
  const defaultValue = 500; // default value in case child cant find parents
  const defaultHeightValue = 10; // default value in case plant is generated without height attribute
  const randomnessY = 20; // random displacement in y direction

  // relating to double placement of children
  const parentList = ["parent1", "parent2"];

  //constants relating to remap function
  const low1 = minPlantHeight;
  const low2 = 0;
  const high2 = 1;

  //constants relating to making plants not overlap
  const plantIDs: string[] = [];
  const plantPositionsX: number[] = [];
  const plantPositionsY: number[] = [];
  let crowdednessTolerance = 0; //dont change this use initial instead
  const initialCrowdednessTolerance = 150;

  //constants relating to adding new plants
  const newPlantIDs: string[] = [];
  const newPlantParent1: string[] = [];

  import { onMount } from "svelte";
  onMount(() => {
    //importNewPlants();
  });

  function mapRange(value: any, low1: any, high1: any, low2: any, high2: any) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  function plantHeight(plant: GardenPlantEntryWithPlant): number {
    return (plant.plant.properties as PlantProperties)["high(m)"] as number;
  }

  function rootScaleFromPlantHeight(plant: GardenPlantEntryWithPlant): number {
    return Math.min(
      Math.pow(
        (plant.plant.properties as PlantProperties)["high(m)"] as number,
        1 / rootScale
      ),
      30
    );
  }

  function remapPlantHeight(value: any, lowIn: any, highIn: any) {
    return mapRange(value, lowIn, highIn, low2, high2);
  }

  function placePlantOnYAxis(plant: GardenPlantEntryWithPlant) {
    return (
      frameSize +
      topBorder +
      maxPlantHeightOutput +
      (monitorHeight - minPlantHeightOutput * 2 - frameSize * 2 - topBorder) *
        (1 - // one minus remapped value in order to make the plants go from small to big
          remapPlantHeight(
            Math.log(rootScaleFromPlantHeight(plant)) + 1,
            Math.log(minPlantHeight) + 1,
            Math.log(maxPlantHeight) + 1
          )) // one minus remapped value in order to make the plants go from small to big
    );
  }

  function placePlantOnXAxis(plant: GardenPlantEntryWithPlant) {
    let proposedPlantPositionX = 0;
    let isSpaceOk = false;

    crowdednessTolerance = initialCrowdednessTolerance;

    while (!isSpaceOk) {
      proposedPlantPositionX = findSpace();
      isSpaceOk = checkIfSpaceIsOk(plant, proposedPlantPositionX);
      crowdednessTolerance -= 1;
    }

    // console.log(crowdednessTolerance); // use to check what crowdedness level each plant landed on
    plantIDs.push(plant.plant.id); // make comment to check if importNewPlants() works
    plantPositionsX.push(proposedPlantPositionX);
    plantPositionsY.push(placePlantOnYAxis(plant));
    return proposedPlantPositionX;
  }

  function findSpace() {
    return (
      (parent?.y ?? defaultValue) +
      (rootScaleFromPlantHeight(parent.plant) -
        rootScaleFromPlantHeight(plant)) *
        yDistribution
    );
  }

  function findParent(plant: SelectPlant, parentName: string) {
    return displayPlants.find(
      (p) => p.plant.id === plant[parentName as keyof SelectPlant]
    );
  }

  function increaseNumberOfChildren(plant: SelectPlant, parentName: string) {
    const parent = displayPlants.find(
      (p) => p.plant.id === plant[parentName as keyof SelectPlant]
    );
    if (parent) {
      parent.numberOfChildren++;
    } else {
      console.log(`Plant not found`);
    }
  }

  function checkIfSpaceIsOk(
    plant: GardenPlantEntryWithPlant,
    proposedPlantPositionX: number
  ) {
    let distanceList = [];
    for (let i = 0; i < plantIDs.length; i++) {
      let distance = calculateDistance(
        plant,
        proposedPlantPositionX,
        plantPositionsX[i],
        plantPositionsY[i]
      );
      distanceList.push(distance);
    }
    return Math.min(...distanceList) >= tolerance;
  }

  function calculateDistance(
    plant: GardenPlantEntryWithPlant,
    proposedPlantPositionX: number,
    x: number,
    y: number
  ): number {
    let plantX = proposedX;
    let plantY = parentY(plant);

    let deltaX = plantX - displayPlants.x;
    let deltaY = plantY - displayPlants.y;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  function randomAnimationDelay(): number {
    return (Math.random() * -animationLength) / 3;
  }
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
        on:load={() => {
          console.log();
        }}
        style:width={minPlantHeightOutput +
          remapPlantHeight(
            rootScaleFromPlantHeight(plant),
            minPlantHeight,
            maxPlantHeight
          ) *
            (maxPlantHeightOutput - minPlantHeightOutput) +
          "px"}
        style:margin-top={placePlantOnYAxis(plant) +
          (Math.random() - 0.5) * randomnessY +
          "px"}
        style:margin-left={placePlantOnXAxis(plant) + "px"}
        style:animation-duration={animationLength + "s"}
        style:animation-delay={randomAnimationDelay() + "s"}
        style:z-index={3000 - plantHeight(plant) * 100}
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

  @keyframes birth-animation {
    0% {
      scale: 0;
      padding-top: var(--padding-top);
    }

    100% {
      scale: 1;
      padding-top: 0px;
    }
  }

  .skew-animated {
    animation:
      skew-animation var(--skew-animation-length) infinite
        var(--skew-animation-delay),
      birth-animation 2s ease-out;
  }

  @keyframes fade-in-out {
    0% {
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  body {
    margin: 0;
    overflow: hidden;
    background: white;
  }

  svg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .spray-dot {
    opacity: 0; /* Start with dots invisible */
    transition: opacity 0.1s linear;
  }

  .moving-dot {
    animation:
      float-move linear infinite,
      fade-in-out 5s; /* Combine animations */
  }
</style>

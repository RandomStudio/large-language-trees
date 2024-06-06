<script lang="ts">
  import type {
    GardenPlantEntryWithPlant,
    GardenViewData,
    PlantProperties,
    SelectPlant,
  } from "$lib/types";
  export let data: GardenViewData;

  let alt = "alt placeholder";

  //distribution on screen and size of plants in database
  const numberOfInitialPlants = 35;
  const rootScale = 2; //maths root not plant roots lol
  const minPlantHeight = Math.pow(0.1, 1 / rootScale);
  const maxPlantHeight = Math.pow(30, 1 / rootScale);
  const randomnessY = 20; // random displacement in y direction

  //plant min and max size on screen
  const minPlantHeightOutput = 75;
  const maxPlantHeightOutput = 200;
  const animationLength = 8;
  const animationDegree = 5;

  //display size and borders
  const monitorWidth = 1920;
  const monitorHeight = 1080;
  const frameSize = 100;
  const topBorder = 100;

  //constants relating to remap function
  const low1 = minPlantHeight;
  const low2 = 0;
  const high1 = maxPlantHeight;
  const high2 = 1;

  //constants relating to making plants not overlap
  const plantIDs: string[] = [];
  const plantPositionsX: number[] = [];
  const plantPositionsY: number[] = [];
  let crowdednessTolerance = 0; //dont change this use initial instead
  const initialCrowdednessTolerance = 250;

  //constants relating to adding new plants
  const newPlantIDs: string[] = [];
  const newPlantParent1: string[] = [];

  import { onMount } from "svelte";
  onMount(() => {
    //pushInitialPlants();
    importNewPlants();
  });

  function mapRange(value: any, low1: any, high1: any, low2: any, high2: any) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  function plantHeight(plant: SelectPlant): number {
    return (plant.properties as PlantProperties)["high(m)"] as number;
  }

  function rootScaleFromPlantHeight(plant: SelectPlant): number {
    return Math.min(
      Math.pow(
        (plant.properties as PlantProperties)["high(m)"] as number,
        1 / rootScale,
      ),
      30,
    );
  }

  function remapPlantHeight(value: any, lowIn: any, highIn: any) {
    return mapRange(value, lowIn, highIn, low2, high2);
  }

  function placePlantOnYAxis(plant: SelectPlant) {
    return (
      frameSize +
      topBorder +
      (monitorHeight - minPlantHeightOutput - frameSize * 2 - topBorder) *
        (1 -
          remapPlantHeight(
            Math.log(rootScaleFromPlantHeight(plant)) + 1,
            Math.log(minPlantHeight) + 1,
            Math.log(maxPlantHeight) + 1,
          )) // one minus remapped value in order to make the plants go from small to big
    );
  }

  function placePlantOnXAxis(plant: SelectPlant) {
    let proposedPlantPositionX = 0;
    let isSpaceOk = false;

    crowdednessTolerance = initialCrowdednessTolerance;

    while (!isSpaceOk) {
      proposedPlantPositionX = findSpace();
      isSpaceOk = checkIfSpaceIsOk(plant, proposedPlantPositionX);
      crowdednessTolerance -= 1;
    }

    // console.log(crowdednessTolerance); // use to check what crowdedness level each plant landed on
    plantIDs.push(plant.id); // make comment to check if importNewPlants() works
    plantPositionsX.push(proposedPlantPositionX);
    plantPositionsY.push(placePlantOnYAxis(plant));
    return proposedPlantPositionX;
  }

  function findSpace() {
    return (
      Math.random() * (monitorWidth - (frameSize + maxPlantHeightOutput)) +
      frameSize
    );
  }

  function checkIfSpaceIsOk(
    plant: SelectPlant,
    proposedPlantPositionX: number,
  ) {
    let distanceList = [];
    for (let i = 0; i < plantIDs.length; i++) {
      let distance = calculateDistance(
        plant,
        proposedPlantPositionX,
        plantPositionsX[i],
        plantPositionsY[i],
      );
      distanceList.push(distance);
    }
    return Math.min(...distanceList) >= crowdednessTolerance;
  }

  function calculateDistance(
    plant: SelectPlant,
    proposedPlantPositionX: number,
    x: number,
    y: number,
  ): number {
    let plantX = proposedPlantPositionX;
    let plantY = placePlantOnYAxis(plant);

    let deltaX = plantX - x;
    let deltaY = plantY - y;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  function randomAnimationDelay(): number {
    return (Math.random() * -animationLength) / 3;
  }

  async function importNewPlants() {
    const response = await fetch("http://localhost:5173/api/plants");
    const newPlants = (await response.json()) as SelectPlant[]; // get all plants info
    for (let i = 0; i < newPlants.length; i++) {
      newPlantIDs.push(newPlants[i].id); // push all plant IDs into list
      newPlantParent1.push(newPlants[i].id); // push all plant parent1 into list
    }
    let confirmedNewPlantIDs = newPlantIDs.filter(
      (item) => !plantIDs.includes(item), // isolate plant IDs that are new
    );
    let children: string[] = [];
    let parents: string[] = [];
    for (let i = 0; i < confirmedNewPlantIDs.length; i++) {
      const plant = newPlants.find(
        (item: any) => item.id === confirmedNewPlantIDs[i], // fetch all info on confirmed new plant
      );
      if (plant && plant.parent1 === null) {
        parents.push(confirmedNewPlantIDs[i]); // if parent1 of new plant is null, it is a users own plant
      } else {
        children.push(confirmedNewPlantIDs[i]); // if parent of new plant is anything else, it is the result of a cross-breeding
      }
    }
    for (let i = 0; i < parents.length; i++) {
      addParents(parents[i], newPlants);
      //plantIDs.push(parents[i]);
    }
    for (let i = 0; i < children.length; i++) {
      addChildren(children[i]);
      //plantIDs.push(children[i]);
    }
  }

  function addParents(plantToAddId: string, newPlants: SelectPlant[]) {
    const plant = newPlants.find((item: any) => item.id === plantToAddId); //find the plant by ID

    if (plant) {
      const img = document.createElement("img");
      img.src = plant.imageUrl ?? "";

      // set the style and position
      img.className = "fixed skew-animated";
      img.style.marginTop = `${placePlantOnYAxis(plant) + (Math.random() - 0.5) * randomnessY}px`;
      img.style.marginLeft = `${placePlantOnXAxis(plant)}px`;
      img.style.width = `${
        minPlantHeightOutput +
        remapPlantHeight(
          rootScaleFromPlantHeight(plant),
          minPlantHeight,
          maxPlantHeight,
        ) *
          (maxPlantHeightOutput - minPlantHeightOutput)
      }px`;
      img.style.zIndex = `${3000 - plantHeight(plant) * 100}`;
      img.style.height = "auto";
      img.style.animationDuration = "8s";

      const element = document.getElementById("container");
      if (element) {
        element.appendChild(img);
      } else {
        console.error("Element with ID 'container' not found.");
      }
    } else {
      console.error(`Plant with ID '${plantToAddId}' not found.`);
    }
  }
  function addChildren(children: string) {
    // add children to DOM
  }
</script>

<body>
  <div id="container" class="fixed top-0 left-0 w-screen h-screen">
    {#each data.garden.plantsInGarden.slice(0, numberOfInitialPlants) as plant}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <img
        src={plant.plant.imageUrl}
        {alt}
        class="fixed skew-animated"
        on:load={() => {
          console.log("initial plant");
        }}
        style:width={minPlantHeightOutput +
          remapPlantHeight(
            rootScaleFromPlantHeight(plant.plant),
            minPlantHeight,
            maxPlantHeight,
          ) *
            (maxPlantHeightOutput - minPlantHeightOutput) +
          "px"}
        style:margin-top={placePlantOnYAxis(plant.plant) +
          (Math.random() - 0.5) * randomnessY +
          "px"}
        style:margin-left={placePlantOnXAxis(plant.plant) + "px"}
        style:animation-duration={animationLength + "s"}
        style:animation-delay={randomAnimationDelay() + "s"}
        style:z-index={3000 - plantHeight(plant.plant) * 100}
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
    animation: skew-animation 8s infinite;
  }
</style>

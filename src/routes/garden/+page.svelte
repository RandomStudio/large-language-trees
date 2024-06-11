<script lang="ts">
  import type {
    GardenPlantEntryWithPlant,
    GardenViewData,
    PlantProperties,
    SelectPlant
  } from "$lib/types";
  export let data: GardenViewData;

  import { onMount } from "svelte";

  //constants relating to making plants not overlap
  const initialCrowdednessTolerance = 500;

  //plant min and max size on screen
  const minPlantHeightOutput = 75;
  const maxPlantHeightOutput = 200;
  const animationLength = 8;

  //display size and borders
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
  const low2 = 0;
  const high2 = 1;

  let displayPlants: PositionedPlant[] = [];

  interface PositionedPlant {
    plant: SelectPlant;
    x: number;
    y: number;
    numberOfChildren: number;
  }

  if (data && data.garden && data.garden.plantsInGarden) {
    data.garden.plantsInGarden.sort((a, b) => {
      //sort based on time created so that children can find parents.
      const dateA = new Date(a.plant.created).getTime();
      const dateB = new Date(b.plant.created).getTime();
      return dateA - dateB;
    });

    data.garden.plantsInGarden.forEach((entry) => {
      addPlants(entry.plant);
    });
  }

  function addPlants(plant: SelectPlant) {
    if (plant.parent1 === null) {
      const newPositionedPlant: PositionedPlant = {
        plant: plant,
        x: parentX(plant),
        y: parentY(plant),
        numberOfChildren: 0
      };
      displayPlants.push(newPositionedPlant); // adds plant to list if it's a parent
    } else {
      for (let i = 0; i < parentList.length; i++) {
        increaseNumberOfChildren(plant, parentList[i]);
        const newPositionedPlant: PositionedPlant = {
          plant: plant,
          x: childX(plant, parentList[i]),
          y: childY(plant, parentList[i]),
          numberOfChildren: 0
        };
        displayPlants.push(newPositionedPlant); // adds plant to list if it's a child
      }
    }
    displayPlants = displayPlants;
  }

  function parentX(plant: SelectPlant) {
    let proposedX = 0;
    let spaceOk = false;
    let tolerance = initialCrowdednessTolerance;

    while (!spaceOk) {
      proposedX = frameSize + Math.random() * (monitorWidth - frameSize * 2);
      spaceOk = checkIfSpaceIsOk(plant, proposedX, tolerance);
      tolerance -= 1;
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
            Math.log(maxPlantHeight) + 1
          ))
    );
  }

  function childX(plant: SelectPlant, parentName: string) {
    let parent = findParent(plant, parentName);
    if (!parent) {
      console.log(`Parent plant not found for ${parentName}`);
      return defaultValue; // or another default value you prefer
    }

    // Calculate the X position relative to the parent plant
    const parentX = parent.x;

    // Calculate the X position based on the number of children and the width of the child plant
    const xOffset = 20 + parent.numberOfChildren * xDistribution;

    // Alternate sides for odd and even children to make them expand outwards
    const sign = parent.numberOfChildren % 2 === 0 ? -1 : 1;

    return parentX + sign * xOffset;
  }
  function childY(plant: SelectPlant, parentName: string) {
    let parent = findParent(plant, parentName);
    if (!parent) {
      console.log(`Parent plant not found for ${parentName}`);
      return defaultValue; // or another default value you prefer
    }
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
    plant: SelectPlant,
    proposedX: number,
    tolerance: number
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
    displayPlants: PositionedPlant
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
        maxPlantHeight
      ) *
        (maxPlantHeightOutput - minPlantHeightOutput)
    );
  }

  // function to get property height from a plant, since it's reused
  function plantHeight(plant: SelectPlant): number {
    const value = (plant.properties as PlantProperties)["high(m)"];
    if (typeof value === "number") {
      return (value as number) ?? defaultHeightValue;
    } else {
      return defaultHeightValue;
    }
  }

  // remap plant height to 0 -> 1
  function remapPlantHeight(value: any, lowIn: any, highIn: any) {
    return low2 + ((high2 - low2) * (value - lowIn)) / (highIn - lowIn);
  }

  function rootScaleFromPlantHeight(plant: SelectPlant): number {
    return Math.max(
      smallestPlant,
      Math.min(Math.pow(plantHeight(plant), 1 / rootScale), tallestPlant)
    );
  }
  let alt = "alt placeholder";

  //continously add new plants
  async function importNewPlants() {
    const response = await fetch("http://localhost:5173/api/plants");
    const newPlants = (await response.json()) as SelectPlant[]; // get all plants info

    let existingPlants = displayPlants.map((p) => p.plant); // get the plant from each PositionedPlant

    // Extract ids of existing plants for comparison
    let existingPlantIds = existingPlants.map((p) => p.id);

    let confirmedNewPlants = newPlants.filter(
      (item) => !existingPlantIds.includes(item.id) // isolate plants that are new by comparing ids
    );

    confirmedNewPlants.forEach((entry) => {
      console.log("New plant found! " + JSON.stringify(entry));
      addPlants(entry);
    });
  }

  onMount(() => {
    const intervalId = setInterval(importNewPlants, 1000);
    return () => {
      clearInterval(intervalId);
    };
  });
</script>

<body>
  <div id="container" class="fixed top-0 left-0 w-screen h-screen">
    {#each displayPlants as plant}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <img
        on:click={() => {
          console.log(plant.plant.id);
        }}
        src={plant.plant.imageUrl}
        {alt}
        class="fixed skew-animated"
        style:margin-left={plant.x - scaleFunction(plant.plant) / 2 + "px"}
        style:margin-top={plant.y - scaleFunction(plant.plant) + "px"}
        style:width={scaleFunction(plant.plant) + "px"}
        style:z-index={Math.round(plant.y)}
        style:--skew-animation-delay={(Math.random() * -animationLength) / 3 +
          "s"}
        style:--skew-animation-length={animationLength + "s"}
        style:--padding-top={scaleFunction(plant.plant) * 0.6 + "px"}
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
</style>

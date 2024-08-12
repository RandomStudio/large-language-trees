<script lang="ts">
  import type {
    GardenViewData,
    GardenWithPlants,
    PlantProperties,
    SelectPlant
  } from "$lib/types";
  export let data: GardenViewData;

  import { onMount } from "svelte";
  import { HEIGHT_PROPERTY_KEY } from "$lib/constants";

  //constants relating to making plants not overlap
  const initialCrowdednessTolerance = 500;

  //plant min and max size on screen
  const minPlantHeightOutput = 75;
  const maxPlantHeightOutput = 200;
  const animationLength = 8;
  const skewDegrees = 4.5;

  //display size and borders
  const monitorWidth = 1920;
  const monitorHeight = 1080;
  const frameSize = 150; //general border around all edges
  const topBorder = 0; // extra border on top
  const yDistribution = 22; //size of patches in Y-dimension
  const xDistribution = 32; //size of patches in X-dimension

  //distribution on screen and size of plants in database
  const rootScale = 2;
  const tallestPlant = 30;
  const smallestPlant = 0.1;
  const minPlantHeight = Math.pow(smallestPlant, 1 / rootScale);
  const maxPlantHeight = Math.pow(tallestPlant, 1 / rootScale);
  const defaultHeightValue = 10; // default value in case plant is generated without height attribute

  // relating to double placement of children
  const parentList = ["parent1", "parent2"];

  //constants relating to remap function
  const low2 = 0;
  const high2 = 1;

  const soundFiles = [
    "sound1.mp3",
    "sound2.mp3",
    "sound3.mp3",
    "sound4.mp3",
    "sound5.mp3",
    "sound6.mp3"
  ];

  let displayPlants: PositionedPlant[] = [];

  interface PositionedPlant {
    plant: SelectPlant;
    proposedX: number;
    proposedY: number;
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

  function toRadians(angle: number) {
    return angle * (Math.PI / 180);
  }

  function addPlants(plant: SelectPlant) {
    if (plant.parent1 === null) {
      const newPositionedPlant: PositionedPlant = {
        plant: plant,
        proposedX: parentX(plant),
        proposedY: parentY(plant),
        numberOfChildren: 0
      };
      displayPlants.push(newPositionedPlant); // adds plant to list if it's a parent
    } else {
      for (let i = 0; i < parentList.length; i++) {
        let angle: number = Math.random() * 90;
        increaseNumberOfChildren(plant, parentList[i]);
        const newPositionedPlant: PositionedPlant = {
          plant: plant,
          proposedX: childX(plant, parentList[i], angle),
          proposedY: childY(plant, parentList[i], angle),
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

  function childX(plant: SelectPlant, parentName: string, angle: number) {
    let parent = findParent(plant, parentName);
    if (!parent) {
      console.log(`Parent plant not found for ${parentName}`);
      return parentX(plant);
    }
    const parentXvalue = parent.proposedX;

    const sign = parent.numberOfChildren % 2 === 0 ? -1 : 1;
    return (
      parentXvalue +
      sign *
        Math.cos(toRadians(angle)) *
        (3 * Math.log(parent.numberOfChildren + 1) + 1) *
        xDistribution
    );
  }

  function childY(plant: SelectPlant, parentName: string, angle: number) {
    let parent = findParent(plant, parentName);
    if (!parent) {
      console.log(`Parent plant not found for ${parentName}`);
      return parentY(plant);
    }
    const parentYvalue = parent.proposedY;
    if (plantHeight(parent.plant) >= plantHeight(plant)) {
      return (
        parentYvalue +
        Math.sin(toRadians(angle)) *
          (3 * Math.log(parent.numberOfChildren + 1) + 1) *
          yDistribution
      );
    } else {
      return (
        parentYvalue -
        Math.sin(toRadians(angle)) *
          (3 * Math.log(parent.numberOfChildren + 1) + 1) *
          yDistribution
      );
    }
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

    let deltaX = plantX - displayPlants.proposedX;
    let deltaY = plantY - displayPlants.proposedY;

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
    const value = (plant.properties as PlantProperties)[HEIGHT_PROPERTY_KEY];
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
    const response = await fetch(`/api/users/${data.user.id}/garden`);
    const myGarden = (await response.json()) as GardenWithPlants; // get all plants info

    const newPlants = myGarden.plantsInGarden;

    console.log(
      newPlants.length,
      "plants in my garden vs",
      data.garden.plantsInGarden.length,
      "known"
    );

    let existingPlants = displayPlants.map((p) => p.plant); // get the plant from each PositionedPlant

    // Extract ids of existing plants for comparison
    let existingPlantIds = existingPlants.map((p) => p.id);

    let confirmedNewPlants = newPlants.filter(
      (item) => !existingPlantIds.includes(item.plant.id) // isolate plants that are new by comparing ids
    );

    function getRandomSoundFile() {
      const randomIndex = Math.floor(Math.random() * soundFiles.length);
      return soundFiles[randomIndex];
    }

    confirmedNewPlants.forEach((entry) => {
      console.log("New plant found! " + JSON.stringify(entry));
      const audio = new Audio(getRandomSoundFile());
      audio.play();
      addPlants(entry.plant);
    });
  }

  // New function to calculate grass positions and sizes
  function grassfrontmain(plant: PositionedPlant) {
    const size = 60 + Math.random() * 40; // size range [60-100px]
    return {
      x: plant.proposedX - size / 1 + 25,
      y: plant.proposedY + scaleFunction(plant.plant) - 230, // Adjusted even lower
      size: size,
      flipped: Math.random() < 0.5
    };
  }

  function grassbehindmain(plant: PositionedPlant) {
    const size = 40 + Math.random() * 80; // size range [40-70px]
    return {
      x: plant.proposedX - size / 2,
      y: plant.proposedY - scaleFunction(plant.plant) - size + 180, // Adjusted even higher
      size: size,
      flipped: Math.random() < 0.5
    };
  }

  function grassinbetween2(plant1: PositionedPlant, plant2: PositionedPlant) {
    const extraGrassCount = Math.floor(Math.random() * 5) + 2; // 2 to 6 extra grass images
    const grassImages = [];
    for (let k = 0; k < extraGrassCount; k++) {
      const midX =
        (plant1.proposedX + plant2.proposedX) / 2 + (Math.random() - 0.5) * 20;
      const midY =
        (plant1.proposedY + plant2.proposedY) / 2 + (Math.random() - 0.5) * 20;
      grassImages.push({
        x: midX,
        y: midY, // Adjusted even higher
        size: 60 + Math.random() * 40, // Random size between 60 and 100
        flipped: Math.random() < 0.5 // Randomly flip the grass
      });
    }
    return grassImages;
  }

  function randomextragrass(plant: PositionedPlant) {
    const additionalGrassCount = Math.floor(Math.random() * 3) + 1;
    const grassImages = [];
    for (let i = 0; i < additionalGrassCount; i++) {
      const size = 60 + Math.random() * 40;
      grassImages.push({
        x: plant.proposedX + (Math.random() - 0.5) * 1,
        y: plant.proposedY + (Math.random() - 0.5) * 1 - 50,
        size: size,
        flipped: Math.random() < 0.5
      });
    }
    return grassImages;
  }

  let extraGrassImages: any[] = [];

  function calculateExtraGrassImages(plants: PositionedPlant[]) {
    extraGrassImages = [];

    for (let i = 0; i < plants.length - 1; i++) {
      for (let j = i + 1; j < plants.length; j++) {
        let distance = Math.hypot(
          plants[i].proposedX - plants[j].proposedX,
          plants[i].proposedY - plants[j].proposedY
        );
        if (distance <= 50) {
          extraGrassImages.push(...grassinbetween2(plants[i], plants[j]));
        }
      }
    }
  }
  let showDescriptionBox: number | null = null;

  function displayDescriptionBox(plantId: number) {
    showDescriptionBox = showDescriptionBox === plantId ? null : plantId;
  }

  $: displayPlants, calculateExtraGrassImages(displayPlants);

  onMount(() => {
    const intervalId = setInterval(importNewPlants, 1000);
    return () => {
      clearInterval(intervalId);
    };
  });
</script>

<div
  class="h-screen fixed bg-roel_purple"
  style=" width: 100vw; margin-top: -0px; font-primer;"
></div>
<div id="container" class="fixed top-0 left-0 w-screen h-screen">
  <img
    src="livinggarden_QR.png"
    alt=""
    class="fixed"
    style="width: 168px; margin-top: 50px; margin-left: 50px; background-color: #9EE093;"
  />
  <h1
    class="join-the-garden font-primer fixed top-16 left-0 mt-40 ml-12 text-roel_green text-2xl"
  >
    Join the Garden!
  </h1>
  {#each displayPlants as plant}
    <!-- Plant images and grass below -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img
      on:click={() => {
        console.log(plant.plant.id);
      }}
      src={plant.plant.imageUrl}
      alt=""
      class="fixed skew-animated"
      style="
          margin-left: {plant.proposedX - scaleFunction(plant.plant) / 2}px;
          margin-top: {plant.proposedY - scaleFunction(plant.plant)}px;
          width: {scaleFunction(plant.plant)}px;
          z-index: z-index: {Math.round(plant.proposedY) + 3};
          --skew-animation-delay: {(Math.random() * -animationLength) / 3}s;
          --skew-animation-length: {animationLength}s;
          --padding-top: {scaleFunction(plant.plant) * 0.6}px;
          --skew-offset: {scaleFunction(plant.plant) * -0.05}px;
          --skew-degrees: {skewDegrees}deg;
          --negative-skew-degrees: -{skewDegrees}deg;
        "
      crossorigin="anonymous"
    />
    <img
      src="grassjess.png"
      alt=""
      class="fixed"
      style="
      position: absolute;
          margin-left: {grassbehindmain(plant).x}px;
          margin-top: {grassbehindmain(plant).y}px;
          width: {grassbehindmain(plant).size}px;
          z-index: {Math.round(plant.proposedY)};;
          transform: {grassbehindmain(plant).flipped
        ? 'scaleX(-1)'
        : 'scaleX(1)'};
        "
    />
    <img
      src="grassjess.png"
      alt=""
      class="fixed"
      style="
      position:absolute;
          margin-left: {grassfrontmain(plant).x}px;
          margin-top: {grassfrontmain(plant).y}px;
          width: {grassfrontmain(plant).size}px;
          z-index: {Math.round(plant.proposedY) + 2};
          transform: {grassfrontmain(plant).flipped
        ? 'scaleX(-1)'
        : 'scaleX(1)'};
        "
    />
    {#each randomextragrass(plant) as grass}
      <img
        src="grassjess.png"
        alt=""
        class="fixed grass-outline"
        style="
            margin-left: {grass.x}px;
            margin-top: {grass.y}px;
            width: {grass.size}px;
            z-index: {Math.round(plant.proposedY) + 3};
            transform: {grass.flipped ? 'scaleX(-1)' : 'scaleX(1)'};
          "
      />
    {/each}
    {#if plant.plant.parent1 === null}
      <div
        class="inline-block px-2 py-1 bg-roel_green text-roel_purple font-primer text-3xl"
        style="
        position: absolute;
        margin-left: {plant.proposedX}px;
        margin-top: {plant.proposedY -
          scaleFunction(plant.plant) +
          60}px; <!-- Adjust based on desired placement -->
        z-index: {Math.round(plant.proposedY) + 4};
      "
      >
        Description
        <!-- ... -->
      </div>
    {/if}
  {/each}
  {#each extraGrassImages as grass}
    <img
      src="grassjess.png"
      alt=""
      class="fixed"
      style="
      position: absolute;
          margin-left: {grass.x}px;
          margin-top: {grass.y}px;
          width: {grass.size}px;
          z-index: 0;
          transform: {grass.flipped ? 'scaleX(-1)' : 'scaleX(1)'};
        "
    />
  {/each}
</div>

<style>
  @keyframes skew-animation {
    0% {
      transform: skew(var(--skew-degrees));
      left: var(--skew-offset);
    }
    50% {
      transform: skew(var(--negative-skew-degrees));
      left: 0;
    }
    100% {
      transform: skew(var(--skew-degrees));
      left: var(--skew-offset);
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

  .body {
    background-color: blue;
  }

  @keyframes skew-animation {
    0% {
      transform: skew(var(--skew-degrees));
      left: var(--skew-offset);
    }
    50% {
      transform: skew(var(--negative-skew-degrees));
      left: 0;
    }
    100% {
      transform: skew(var(--skew-degrees));
      left: var(--skew-offset);
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

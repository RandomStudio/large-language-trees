<script lang="ts">
  import type {
    GardenPlantEntryWithPlant,
    GardenViewData,
    PlantProperties,
  } from "$lib/types";
  export let data: GardenViewData;

  let alt = "alt placeholder";

  let rootScale = 2; //maths root not plant roots lol
  let minPlantHeight = Math.pow(0.1, 1 / rootScale); //0.1 squared is (about) 0.32
  let maxPlantHeight = Math.pow(30, 1 / rootScale); //30 squared is (about 5.5)

  let minPlantHeightOutput = 100;
  let maxPlantHeightOutput = 300;
  let animationLength = 8;
  let animationDegree = 5;

  let monitorWidth = 1920;
  let monitorHeight = 1080;
  let frameSize = 50;
  let topBorder = 100;

  let low1 = minPlantHeight;
  let low2 = 0;
  let high1 = maxPlantHeight;
  let high2 = 1;

  import { onMount } from "svelte";
  onMount(() => {
    document.body.style.overflow = "hidden";
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
        1 / rootScale,
      ),
      30,
    );
  }

  function remapPlantHeight(value: any, lowIn: any, highIn: any) {
    return mapRange(value, lowIn, highIn, low2, high2);
  }

  function placePlantOnXAxis(plant: GardenPlantEntryWithPlant) {
    return (
      Math.random() * (monitorWidth - (frameSize + maxPlantHeightOutput)) +
      frameSize
    );
  }

  function placePlantOnYAxis(plant: GardenPlantEntryWithPlant) {
    return (
      frameSize +
      topBorder +
      (monitorHeight - minPlantHeightOutput - frameSize * 2 - topBorder) *
        (1 -
          remapPlantHeight(
            Math.log(rootScaleFromPlantHeight(plant)) + 1,
            Math.log(minPlantHeight) + 1,
            Math.log(maxPlantHeight) + 1,
          )) + // one minus remapped value in order to make the plants go from small to big
      (Math.random() - 0.5) * 10 // a bit of random ofset
    );
  }

  function randomAnimationDelay(): number {
    return (Math.random() * -animationLength) / 3;
  }
</script>

<body>
  <div class="fixed top-0 left-0 w-screen h-screen">
    {#each data.garden.plantsInGarden as plant}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <img
        src={plant.plant.imageUrl}
        {alt}
        class="fixed skew-animated"
        style:width={minPlantHeightOutput +
          remapPlantHeight(
            rootScaleFromPlantHeight(plant),
            minPlantHeight,
            maxPlantHeight,
          ) *
            (maxPlantHeightOutput - minPlantHeightOutput) +
          "px"}
        style:margin-left={placePlantOnXAxis(plant) + "px"}
        style:margin-top={placePlantOnYAxis(plant) + "px"}
        style:animation-duration={animationLength + "s"}
        style:animation-delay={randomAnimationDelay() + "s"}
        style:z-index={3000 - plantHeight(plant) * 100}
        on:click={() => {
          console.log(
            remapPlantHeight(
              Math.log(rootScaleFromPlantHeight(plant)) + 1,
              Math.log(minPlantHeight) + 1,
              Math.log(maxPlantHeight) + 1,
            ),
          );
        }}
      />
    {/each}
  </div>
</body>

<style>
  @keyframes skew-animation {
    0% {
      transform: skew(5deg);
      left: -7px;
    }
    50% {
      transform: skew(-5deg);
      left: 7px;
    }
    100% {
      transform: skew(5deg);
      left: -7px;
    }
  }

  .skew-animated {
    animation: skew-animation infinite;
  }
</style>

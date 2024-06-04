<script lang="ts">
  import type {
    GardenPlantEntryWithPlant,
    GardenViewData,
    PlantProperties,
  } from "$lib/types";
  export let data: GardenViewData;

  let alt = "alt placeholder";

  let minPlantHeight = 0.32; //0.1 squared is (about) 0.32
  let maxPlantHeight = 5.5; //30 squared is (about 5.5)

  let minPlantHeightOutput = 100;
  let maxPlantHeightOutput = 200;

  let monitorWidth = 1920;
  let monitorHeight = 1080;
  let frameSize = 50;

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

  function scaleFromPlantHeight(plant: GardenPlantEntryWithPlant): number {
    return Math.min(
      Math.sqrt(
        (plant.plant.properties as PlantProperties)["high(m)"] as number,
      ),
      30,
    );
  }

  function squaredScaleFromPlantHeight(
    plant: GardenPlantEntryWithPlant,
  ): number {
    return Math.min(
      Math.sqrt(
        (plant.plant.properties as PlantProperties)["high(m)"] as number,
      ),
      30,
    );
  }

  function remapPlantHeight(value: any) {
    return mapRange(value, low1, high1, low2, high2);
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
      (monitorHeight - maxPlantHeightOutput - frameSize) *
        (1 - remapPlantHeight(scaleFromPlantHeight(plant))) // One minus remapped value in order to make the plants go from small to big
    );
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
        class="fixed"
        style:width={minPlantHeightOutput +
          remapPlantHeight(scaleFromPlantHeight(plant)) * maxPlantHeightOutput +
          "px"}
        style:margin-left={placePlantOnXAxis(plant) + "px"}
        style:margin-top={placePlantOnYAxis(plant) + "px"}
        on:click={() => {
          console.log(remapPlantHeight(scaleFromPlantHeight(plant)));
        }}
      />
    {/each}
  </div>
</body>

<style>
</style>

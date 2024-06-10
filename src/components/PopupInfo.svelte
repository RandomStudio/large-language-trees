<script lang="ts">
  import { goto } from "$app/navigation";
  import type { SelectPlant } from "$lib/types";
  import ButtonBottom from "./ButtonBottom.svelte";

  import PlantDisplay from "./PlantDisplay.svelte";

  export let plantDetails: SelectPlant;
  export let closePopup: () => any;

  function updatePlantDetails(plant: SelectPlant) {
    plantDetails = plant;
  }

  let width: string;
  export let isOriginalPlant: boolean;
</script>

<button
  class="fixed top-8 right-7 z-50 text-roel_blue flex items-center justify-center w-10 h-10 border-2 border-roel_blue rounded-full"
  on:click={closePopup}
>
  <svg
    class="w-6 h-6 text-roel_blue"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M15 19l-7-7 7-7" />
  </svg>
</button>

<div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green">
  <div class="mx-12 font-inter text-roel_blue text-left mt-20">
    <PlantDisplay plant={plantDetails} applyFilters={false} />
    <p class="text-sm mt-4">
      {plantDetails.description}
    </p>
  </div>
</div>

{#if isOriginalPlant}
  <ButtonBottom
    buttonText="Start Pollinating"
    functionClick={() => goto("/pollination")}
  ></ButtonBottom>
{/if}

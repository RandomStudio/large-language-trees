<script lang="ts">
  import { goto } from "$app/navigation";
  import type { SelectPlant } from "$lib/types";
  import ButtonBottom from "./ButtonBottom.svelte";

  import PlantDisplay from "./PlantDisplay.svelte";
  import ReturnButton from "./ReturnButton.svelte";

  export let plantDetails: SelectPlant;
  export let closePopup: () => any;

  function updatePlantDetails(plant: SelectPlant) {
    plantDetails = plant;
  }

  let width: string;
  export let isOriginalPlant: boolean;
</script>

<ReturnButton functionReturn={closePopup}></ReturnButton>

<div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green overflow-auto">
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

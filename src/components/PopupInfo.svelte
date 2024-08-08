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

  export let isOriginalPlant: boolean;
  export let isPollinatingPlant: boolean;
</script>

<ReturnButton onClicked={closePopup}></ReturnButton>

<div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green overflow-auto">
  <div class="mx-10 font-primer text-roel_blue text-left mt-20 mb-20">
    <PlantDisplay plant={plantDetails} applyFilters={false} />
    {#if !isOriginalPlant}
      <p class="text-base mt-4 text-center">
        Date of discovery : {plantDetails.created.getDate()}/{plantDetails.created.getUTCMonth() +
          1}/{plantDetails.created.getFullYear()} at {plantDetails.created.getHours()}:{plantDetails.created.getMinutes()}
      </p>
    {/if}
    <p class="text-base mt-4">
      {plantDetails.description}
    </p>
  </div>
</div>

{#if isPollinatingPlant || isOriginalPlant}
  <ButtonBottom
    buttonText="Start Pollinating"
    functionClick={() => goto("gallery/pollination/" + plantDetails.id)}
  ></ButtonBottom>
{/if}

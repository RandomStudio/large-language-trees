<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    type SeedbankEntryWithPlant,
    type GardenViewData,
    type MyGarden
  } from "../../lib/types";
  import PlantDisplay from "../../components/PlantDisplay.svelte";
  import QrGenerate from "../../components/qr_generate.svelte";

  export let data: GardenViewData;

  let selectedPlant = data.seedBank.plantsInSeedbank[0].plant;
  let showMessage = true;
  let showNewParagraph = false; // Control visibility of the new paragraph
  let showDescription = true; // Control visibility of the plant description
  let showBarcode = false; // Control visibility of the barcode

  let buttonText = "Great!";

  function handleButtonClick() {
    if (buttonText === "Great!") {
      showMessage = false;
      showDescription = false; // Hide the plant description
      showNewParagraph = true; // Show the new paragraph
      showBarcode = true; // Show the barcode
      buttonText = "Start Pollinating!";
    } else {
      goto("./pollination"); // Navigate to the pollination route
    }
  }
</script>

<div class="font-inter">
  <main class="mx-14 mt-10">
    {#if showMessage}
      <p class="text-roel_blue text-2xl">
        Dear digital gardener,<br />Here is your first plant!
      </p>
    {/if}
    <div class="text-left mb-8 relative">
      {#if selectedPlant}
        <PlantDisplay plant={selectedPlant} width="w-96"></PlantDisplay>
        <!-- Set a larger width explicitly -->
        {#if showDescription}
          <p class="text-roel_blue mt-4 mb-8">
            {selectedPlant.description}
          </p>
        {/if}
        {#if showBarcode}
          <div class="absolute top-0 right-0 mt-2 mr-2">
            <QrGenerate text={selectedPlant.id} />
          </div>
        {/if}
      {:else}
        <p class="text-roel_blue">No plants available</p>
      {/if}
    </div>
    <div class="mt-6 text-center">
      <button
        class="bg-roel_green text-roel_blue font-semibold py-2 px-4 border-2 border-roel_blue rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
        style="width:250px;"
        on:click={handleButtonClick}
      >
        {buttonText}
      </button>
    </div>
  </main>
</div>

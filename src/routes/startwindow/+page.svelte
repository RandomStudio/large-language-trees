<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    type SeedbankEntryWithPlant,
    type GardenViewData,
    type MyGarden,
  } from "../../lib/types";
  import PlantDisplay from "../../components/PlantDisplay.svelte";
  import QrGenerate from "../../components/qr_generate.svelte";
  import ButtonBottom from "../../components/ButtonBottom.svelte";

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
      buttonText = "Start Pollinating";
    } else {
      goto("./pollination"); // Navigate to the pollination route
    }
  }
</script>

<div class="mx-12 font-inter text-roel_blue text-left">
  {#if showMessage}
    <p class="text-xl">Dear digital gardener, here is your first plant!</p>
  {:else}
    <p class="text-xl">
      Now find a fellow gardener in the studio and scan their barcode to start
      pollinating.
    </p>
  {/if}

  <div>
    {#if selectedPlant}
      <PlantDisplay plant={selectedPlant}></PlantDisplay>

      {#if showDescription}
        <p class="text-sm mt-4">
          {selectedPlant.description}
        </p>
      {/if}
      {#if showBarcode}
        <div class="absolute top-0 right-0 mt-2 mr-2 hidden">
          <QrGenerate text={selectedPlant.id} />
        </div>
      {/if}
    {:else}
      <p>No plants available</p>
    {/if}
  </div>
  <div class="mt-4">
    <ButtonBottom {buttonText} functionClick={handleButtonClick}></ButtonBottom>
  </div>
</div>

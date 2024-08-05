<script lang="ts">
  import { goto } from "$app/navigation";
  import { type GardenViewData } from "../../../lib/types";
  import PlantDisplay from "../../../components/PlantDisplay.svelte";
  import QrGenerate from "../../../components/qr_generate.svelte";
  import ButtonBottom from "../../../components/ButtonBottom.svelte";

  export let data: GardenViewData;

  let selectedPlant = data.seedbank.plantsInSeedbank[0].plant;
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
      goto("./gallery/pollination/" + selectedPlant.id); // Navigate to the pollination route
    }
  }
</script>

<div class="bg-roel_blue rounded-b-full">
  <div class="font-primer text-roel_green text-left pt-[68px]">
    {#if showMessage}
      <p class="mx-10 text-2xl -mb-5">
        Dear digital gardener, here is your first plant!
      </p>
    {:else}
      <p class="mx-10 text-2xl -mb-5">
        Now find a fellow gardener in the studio and scan their barcode to start
        pollinating.
      </p>
    {/if}
    {#if selectedPlant}
      <div class="mx-auto mt-3 w-64">
        <PlantDisplay plant={selectedPlant}></PlantDisplay>
      </div>
    {:else}
      <p>No plants available</p>
    {/if}
  </div>
</div>
<div class="mx-10 font-primer text-roel_blue mb-[130px]">
  <div>
    <div>
      {#if selectedPlant}
        {#if showDescription}
          <p class="text-3xl mt-4 text-center">
            {selectedPlant.commonName}
          </p>
          <p class="text-base mt-3">
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
  </div>
  <div class="mt-4">
    <ButtonBottom {buttonText} functionClick={handleButtonClick}></ButtonBottom>
  </div>
</div>

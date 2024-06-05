<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    type SeedbankEntryWithPlant,
    type GardenViewData,
    type MyGarden,
  } from "../../lib/types";
  import PlantDisplay from "../../components/PlantDisplay.svelte";

  export let data: GardenViewData;

  let selectedPlant = data.seedBank.plantsInSeedbank[0].plant;
  let showMessage = true;
  let showNewParagraph = false; // Control visibility of the new paragraph

  let buttonText = "Great!";

  function handleButtonClick() {
    if (buttonText === "Great!") {
      showMessage = false;
      showNewParagraph = true; // Show the new paragraph
      buttonText = "Start Pollinating!";
    } else {
      goto("./pollination"); // Navigate to the pollination route
    }
  }
</script>

<div>
  <main class="mx-14 mt-20">
    {#if showMessage}
      <p class="text-roel_blue font-garamond text-3xl">
        Dear aspiring gardener, We have selected a plant for you!
      </p>
    {/if}
    <div class="text-left mb-8 font-oldstandard">
      {#if selectedPlant}
        <PlantDisplay plant={selectedPlant}></PlantDisplay>
        <p class="text-roel_blue mt-4 mb-8">
          {selectedPlant.description}
        </p>
      {:else}
        <p class="text-roel_blue">No plants available</p>
      {/if}
    </div>
    {#if showNewParagraph}
      <div class="relative flex mt-6 mb-6 border border-transparent">
        <p class="text-roel_blue font-garamond text-3xl">
          Find a fellow gardener irl and scan their barcode to start
          pollinating.
        </p>
      </div>
    {/if}
    <div class="mt-6 text-center">
      <button
        class="bg-transparent text-roel_blue font-oldstandard py-2 px-4 border-2 border-blue-500 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent"
        style="width:300px;"
        on:click={handleButtonClick}
      >
        {buttonText}
      </button>
    </div>
  </main>
</div>

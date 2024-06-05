<script lang="ts">
  import { goto } from "$app/navigation";
  import { type GardenViewData, type SelectPlant } from "../../lib/types"; // Adjust the import paths as necessary

  export let data: GardenViewData;

  import PlantDisplay from "../../components/PlantDisplay.svelte";
  let selectedPlant: SelectPlant | null = null;

  import PopupInfo from "../../components/PopupInfo.svelte";

  let seedBank = data.seedBank.plantsInSeedbank;
  let allSeeds = data.garden.plantsInGarden;
  let width: string;
</script>

<div class="min-h-screen bg-roel_green overflow-hidden font-oldstandard">
  <div class="grid grid-rows-1 grid-cols-2 text-center mt-2">
    <div class="border-roel_blue border-2 text-roel_blue border-l-0">
      <a href="./gallery">Gallery</a>
    </div>
    <div
      class="border-roel_blue border-2 text-neutral-500 border-l-0 border-r-0"
    >
      <a href="../pollination">Pollination</a>
    </div>
  </div>
  <main class="mx-10 mt-20">
    <div class="text-center w-full">
      <br />
      <br />
      {#each seedBank as plant, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={() => {
            console.log("click!");
            selectedPlant = plant.plant;
          }}
          class="cursor-pointer"
        >
          <PlantDisplay
            plant={plant.plant}
            {width}
            applyFilters={index !== 0}
          />
        </div>
        <br />
        <br />
      {/each}
    </div>

    {#if selectedPlant}
      <PopupInfo
        plantDetails={selectedPlant}
        closePopup={() => {
          selectedPlant = null;
        }}
      ></PopupInfo>
    {/if}

    <div class="mt-4 text-center">
      <button
        class="bg-transparent text-roel_blue py-2 px-4 border-2 border-roel_blue rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
        style="width:250px;"
        on:click={() => goto("/pollination")}
      >
        Start Pollinating
      </button>
    </div>
  </main>
</div>

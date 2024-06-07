<script lang="ts">
  import { goto } from "$app/navigation";
  import { type GardenViewData, type SelectPlant } from "../../lib/types";

  export let data: GardenViewData;

  import PlantDisplay from "../../components/PlantDisplay.svelte";
  let selectedPlant: SelectPlant | null = null;

  import PopupInfo from "../../components/PopupInfo.svelte";

  let seedBank = data.seedBank.plantsInSeedbank;
  let allSeeds = data.garden.plantsInGarden;
  let width: string;
</script>

<div class="min-h-screen bg-roel_green overflow-hidden font-oldstandard">
  <main class="mx-10 mt-0">
    <div class="text-center w-full">
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
        {#if index == 0}
          <div class="mt-4 text-center">
            <button
              class="bg-roel_green text-roel_blue font-inter py-2 px-4 border-2 border-roel_blue rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
              style="width:250px;"
              on:click={() => goto("/pollination")}
            >
              Start Pollinating
            </button>
          </div>
        {/if}
        {#if selectedPlant}
          <PopupInfo
            plantDetails={selectedPlant}
            closePopup={() => {
              selectedPlant = null;
            }}
            isOriginalPlant={index == 0}
          ></PopupInfo>
        {/if}
        <br />
        <br />
      {/each}
    </div>
  </main>
</div>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { type GardenViewData, type SelectPlant } from "../../lib/types"; // Adjust the import paths as necessary

  export let data: GardenViewData;

  import PlantDisplay from "../../components/PlantDisplay.svelte";
  let selectedPlant: SelectPlant | null = null;

  import PopupInfo from "../../components/PopupInfo.svelte";

  let seedBank = data.seedBank.plantsInSeedbank;
</script>

<div class="min-h-screen bg-roel_green overflow-hidden">
  <div class="fixed top-10 left-10">
    <h1 class="text-3xl text-roel_blue">The Garden</h1>
  </div>

  <main class="mx-10 mt-20">
    <div class="text-center w-full">
      <br />
      <br />
      {#each seedBank as plant}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={() => {
            console.log("click!");
            selectedPlant = plant.plant;
          }}
          class="cursor-pointer"
        >
          <div class="text-left">
            <PlantDisplay plant={plant.plant} width="70%"></PlantDisplay>
          </div>
        </div>
        <br />
        <br />
      {/each}
    </div>

    {#if selectedPlant}
      <PopupInfo
        plantDetails={selectedPlant}
        {data}
        closePopup={() => {
          selectedPlant = null;
        }}
      ></PopupInfo>
    {/if}

    <div class="mt-4 text-center">
      <button
        class="bg-transparent text-roel_blue py-2 px-4 border-2 border-blue-500 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
        style="width:250px;"
        on:click={() => goto("/seeds_bank")}
      >
        Start Pollinating
      </button>
    </div>
  </main>
</div>

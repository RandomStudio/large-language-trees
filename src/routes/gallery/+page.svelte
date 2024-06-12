<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { type GardenViewData, type SelectPlant } from "../../lib/types";

  export let data: GardenViewData;

  import PlantDisplay from "../../components/PlantDisplay.svelte";
  import PopupInfo from "../../components/PopupInfo.svelte";
  import PopupAfterCrossbreed from "../../components/PopupAfterCrossbreed.svelte";

  let selectedPlant: SelectPlant | null = null;
  let newItemAdded = false;
  const seedBank = data.seedBank.plantsInSeedbank;

  onMount(() => {
    const interval = setInterval(() => {
      console.log(newItemAdded);
      console.log(data.seedBank.plantsInSeedbank.length);
      console.log(seedBank.length);
      if (data.seedBank.plantsInSeedbank != seedBank) {
        newItemAdded = true;
        console.log("New element in your seedbank");
        /*
      setTimeout(() => {
        newItemAdded = false;
      }, 2000);
      */
      }
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="mx-12 font-inter text-roel_blue text-left">
  {#each seedBank as plant, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:click={() => {
        console.log("click!");
        selectedPlant = plant.plant;
      }}
      class="cursor-pointer mt-4"
    >
      <PlantDisplay plant={plant.plant} applyFilters={index !== 0} />
    </div>
    {#if index == 0}
      <div class="mt-4 text-center">
        <button
          class="bg-roel_green text-roel_blue font-inter text-xl px-4 py-2 border-2 w-11/12 max-w-xs border-roel_blue rounded-full"
          on:click={() => goto("/pollination")}
        >
          Start Pollinating
        </button>
      </div>
    {/if}
  {/each}
</div>

{#if selectedPlant}
  <PopupInfo
    plantDetails={selectedPlant}
    closePopup={() => {
      selectedPlant = null;
    }}
    isOriginalPlant={selectedPlant.id == seedBank[0].plant.id}
  ></PopupInfo>
{/if}

{#if newItemAdded}
  <PopupAfterCrossbreed
    newPlant={data.seedBank.plantsInSeedbank[0].plant}
    closePopup={() => {
      newItemAdded = false;
    }}
  ></PopupAfterCrossbreed>
{/if}

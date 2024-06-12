<script lang="ts">
  import { goto } from "$app/navigation";
  import { type GardenViewData, type SelectPlant } from "../../lib/types";

  export let data: GardenViewData;

  import PlantDisplay from "../../components/PlantDisplay.svelte";
  let selectedPlant: SelectPlant | null = null;

  import PopupInfo from "../../components/PopupInfo.svelte";

  let seedBank = data.seedBank.plantsInSeedbank;

  import { setIndexValue } from "../gallery/shared.js";

  function handleClick(index: number) {
    setIndexValue(index);
    goto(`/pollination`);
  }
  const now = new Date();

  function millisecondsToMinutes(duration: number) {
    let minutes = duration / (1000 * 60);
    minutes = Math.ceil(minutes);
    return minutes;
  }
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
    {#if Math.abs((now.getTime() - plant.plant.created.getTime()) / (1000 * 3600)) > 1}
      <div class="mt-4 text-center">
        <button
          class="bg-roel_green text-roel_blue font-inter text-xl px-4 py-2 border-2 w-11/12 max-w-xs border-roel_blue rounded-full"
          on:click={() => handleClick(index)}
        >
          Start Pollinating
        </button>
      </div>
    {:else}
      <div class="mt-4 text-center">
        <button
          class="text-center border-2 px-4 py-2 border-mid_grey rounded-full font-inter text-dark_grey text-xl w-11/12 max-w-x"
        >
          Wait for {60 -
            millisecondsToMinutes(
              Math.abs(now.getTime() - plant.plant.created.getTime())
            )} minutes ...
        </button>
      </div>
    {/if}
  {/each}
  <br />
  <br />
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

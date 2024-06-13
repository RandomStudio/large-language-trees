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

  let yourPlant: SelectPlant | null =
    data.seedBank.plantsInSeedbank.find(
      (plant) => plant.plant.parent1 == null && plant.plant.parent2 == null
    )?.plant || null;
</script>

<div class="mx-12 font-inter text-roel_blue text-left">
  {#each seedBank as plant, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->

    {#if Math.abs((now.getTime() - plant.plant.created.getTime()) / (1000 * 60)) > 5 || plant.plant == yourPlant}
      <div
        on:click={() => {
          console.log("click!");
          selectedPlant = plant.plant;
          setIndexValue(index);
        }}
        class="cursor-pointer mt-4"
      >
        <PlantDisplay plant={plant.plant} applyFilters={false} />
      </div>
      <div class="mt-4 text-center">
        <button
          class="bg-roel_green text-roel_blue font-inter text-xl px-4 py-2 border-2 w-11/12 max-w-xs border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green"
          on:click={() => handleClick(index)}
        >
          Start Pollinating
        </button>
      </div>

      {#if selectedPlant}
        <PopupInfo
          plantDetails={selectedPlant}
          closePopup={() => {
            selectedPlant = null;
          }}
          isOriginalPlant={plant.plant == yourPlant}
          isPollinatingPlant={true}
        ></PopupInfo>
      {/if}
    {:else}
      <div
        on:click={() => {
          console.log("click!");
          selectedPlant = plant.plant;
        }}
        class="cursor-pointer mt-4"
      >
        <PlantDisplay plant={plant.plant} applyFilters={true} />
      </div>
      <div class="mt-4 text-center">
        <button
          class="bg-roel_green text-roel_blue font-inter text-xl px-4 py-2 border-2 w-11/12 max-w-xs border-roel_blue rounded-full text-opacity-50 border-opacity-50"
        >
          Fertile in {5 -
            millisecondsToMinutes(
              Math.abs(now.getTime() - plant.plant.created.getTime())
            )} minutes
        </button>
      </div>
      {#if selectedPlant}
        <PopupInfo
          plantDetails={selectedPlant}
          closePopup={() => {
            selectedPlant = null;
          }}
          isOriginalPlant={false}
          isPollinatingPlant={false}
        ></PopupInfo>
      {/if}
    {/if}
  {/each}
  <br />
  <br />
</div>

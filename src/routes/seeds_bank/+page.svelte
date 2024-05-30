<script lang="ts">
  import {
    type GardenPlantEntry,
    type InsertPlant,
    type MyGarden,
    type SeedbankEntryWithPlant,
    type SelectPlant,
  } from "../../lib/types"; // Assuming type import is correct

  import { goto } from "$app/navigation";
  interface GardenViewData {
    seeds: SeedbankEntryWithPlant[];
    username: string;
    garden: MyGarden;
  }

  export let data: GardenViewData;
  let selectedPlant: SelectPlant | null = null;

  console.log(data.seeds);
  import { GRID_HEIGHT, GRID_WIDTH } from "../../defaults/constants";
  import PlantCell from "../../components/PlantCell.svelte";

  import PopupInfo from "../../components/PopupInfo.svelte";
  import { buildPrompt } from "../../lib/promptUtils";

  import DefaultPromptConfig from "../../defaults/prompt-config";
  import ConfirmBreed from "../../components/ConfirmBreed.svelte";
  import FullScreenLoading from "../../components/FullScreenLoading.svelte";
  import { invalidateAll } from "$app/navigation";
  import { enhance } from "$app/forms";
</script>

<div class="min-h-screen bg-roel_green overflow-hidden">
  <div class="fixed top-10 left-10">
    <h1 class="text-3xl text-roel_blue">The Garden</h1>
  </div>
  <main class="mx-10 mt-20">
    <div class="text-center w-full">
      <br />
      <br />
      {#each data.seeds as plant}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={() => {
            console.log("click!");
            selectedPlant = plant.plant;
          }}
          class="cursor-pointer"
        >
          <div class="flex justify-center">
            <img
              src={plant.plant.imageUrl}
              alt={plant.plant.commonName}
              width="70%"
            />
          </div>
          <br />
          <p class="text-center text-roel_blue">
            {plant.plant.commonName}
          </p>
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

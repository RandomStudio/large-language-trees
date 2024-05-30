<script lang="ts">
  import {
    type GardenPlantEntry,
    type InsertPlant,
    type MyGarden,
    type SeedbankEntryWithPlant,
    type SelectPlant,
  } from "../../lib/types"; // Assuming type import is correct

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

<div class="min-h-screen bg-green-300 overflow-hidden">
  <main class="mx-10 mt-20">
    <div class="fixed top-10 left-10">
      <h1 class="text-3xl text-blue-600">The Garden</h1>
    </div>

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
          <p class="text-center text-blue-600 font-semibold">
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
  </main>
</div>

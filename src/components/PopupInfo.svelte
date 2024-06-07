<script lang="ts">
  import { goto } from "$app/navigation";
  import type { SelectPlant } from "$lib/types";

  import PlantDisplay from "./PlantDisplay.svelte";

  export let plantDetails: SelectPlant;
  export let closePopup: () => any;

  function updatePlantDetails(plant: SelectPlant) {
    plantDetails = plant;
  }

  let width: string;
  export let isOriginalPlant: boolean;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green flex justify-center items-center"
  on:click={closePopup}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="m-8 p-4 rounded-lg max-w-lg" on:click|stopPropagation>
    <button
      class="fixed top-8 right-7 text-roel_blue flex items-center justify-center w-10 h-10 border-2 border-roel_blue rounded-full"
      on:click={closePopup}
    >
      <svg
        class="w-6 h-6 text-roel_blue"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <PlantDisplay plant={plantDetails} {width} applyFilters={false} />
    <p
      class="text-roel_blue mx-4 w-full max-w-4xl pt-8 text-sm text-left font-inter"
    >
      {plantDetails.description}
    </p>
    {#if isOriginalPlant}
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
  </div>
</div>

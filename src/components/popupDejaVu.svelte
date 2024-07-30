<script lang="ts">
  import { goto } from "$app/navigation";
  import type { SelectPlant } from "$lib/types";
  import ButtonBottom from "./ButtonBottom.svelte";
  import PlantDisplay from "./PlantDisplay.svelte";
  import ReturnButton from "./ReturnButton.svelte";

  export let plantDetails: SelectPlant;

  function handleClose() {
    goto("../");
  }
</script>

<ReturnButton functionReturn={handleClose}></ReturnButton>

<div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green">
  <div class="overflow-y-auto" style="max-height: calc(100% - 4rem);">
    <div class="mx-10 font-primer text-roel_blue text-left mt-20">
      <p class="text-2xl">Whoops! C'est un déjà-vu!</p>
      <div class="mt-4">
        <PlantDisplay plant={plantDetails} applyFilters={false} />
        <p class="font-primer text-base mt-4">
          {plantDetails.description}
        </p>
        <br />
        <br />
      </div>
    </div>
  </div>
</div>

<ButtonBottom buttonText="Back" functionClick={handleClose} width="w-7/12"
></ButtonBottom>

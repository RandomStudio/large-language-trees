<script lang="ts">
  import { goto } from "$app/navigation";
  import type { SelectPlant } from "$lib/types";
  import ButtonBottom from "./ButtonBottom.svelte";

  import PlantDisplay from "./PlantDisplay.svelte";
  import ReturnButton from "./ReturnButton.svelte";

  export let newPlant: SelectPlant;
  export let closePopup: () => any;
</script>

<ReturnButton functionReturn={closePopup}></ReturnButton>

<div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green">
  <div class="overflow-y-auto" style="max-height: calc(100% - 4rem);">
    <div class="mx-12 font-inter text-roel_blue text-left mt-20">
      <p class="text-xl">
        Ta-da! Presenting the plant you and your pollination buddy brewed up!
      </p>
      <div class="mt-4">
        <PlantDisplay plant={newPlant} applyFilters={false} />
        <p class="text-sm mt-4">
          {newPlant.description}
        </p>
        <br />
        <br />
      </div>
    </div>
  </div>
</div>

<ButtonBottom buttonText="Back" functionClick={closePopup} width="w-7/12"
></ButtonBottom>

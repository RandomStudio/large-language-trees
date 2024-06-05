<script lang="ts">
  import type { SelectPlant } from "$lib/types";

  export let allSeeds: SelectPlant[];
  export let plantDetails: SelectPlant;

  export let closePopup: () => any;

  function updatePlantDetails(plant: SelectPlant) {
    plantDetails = plant;
  }

  let parent1 = allSeeds.find((plant) => plant.id === plantDetails.parent1);
  let parent2 = allSeeds.find((plant) => plant.id === plantDetails.parent2);
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="fixed top-0 left-0 right-0" on:click={closePopup}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="border bg-roel_blue m-8 p-4 rounded" on:click|stopPropagation>
    <div class="flex justify-end items-center mb-4">
      <button
        type="button"
        class="bg-transparent text-roel_green font-semibold"
        on:click={closePopup}
        aria-label="Close popup">&times;</button
      >
    </div>
    <img
      class="md:max-w-20"
      src={plantDetails.imageUrl}
      alt="Drawing of a {plantDetails.commonName}"
    />
    <p class="mt-4 text-center text-roel_green">{plantDetails.commonName}</p>
    <p class="text-center text-roel_green">{plantDetails.description}</p>
  </div>
</div>

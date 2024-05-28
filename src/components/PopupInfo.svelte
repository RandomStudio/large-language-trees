<script lang="ts">
  import type { SelectPlant } from "$lib/types";

  export let data: { seeds: SelectPlant[] };

  export let plantDetails: SelectPlant;

  type PlantProperties = { [key: string]: string | number };

  const plantProperties = plantDetails.properties as PlantProperties;

  export let closePopup: () => any;

  let parent1 = data.seeds.find((plant) => plant.id === plantDetails.parent1);
  let parent2 = data.seeds.find((plant) => plant.id === plantDetails.parent2);

  function updatePlantDetails(plant: SelectPlant) {
    plantDetails = plant;
    parent1 = data.seeds.find((plant) => plant.id === plantDetails.parent1);
    parent2 = data.seeds.find((plant) => plant.id === plantDetails.parent2);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="fixed top-0 left-0 right-0 bottom-0" on:click={closePopup}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="relative border m-0 p-0 rounded min-h-screen bg-green-300"
    on:click|stopPropagation
  >
    <h1 class="text-3xl font-bold text-blue-600 ml-4">The Garden</h1>
    <div class="absolute top-0 right-0">
      <button
        type="button"
        class="bg-transparent font-semibold text-blue-600 text-2xl"
        on:click={closePopup}
        aria-label="Close popup">&times;</button
      >
    </div>

    <img
      src={plantDetails.imageUrl}
      alt="Drawing of a {plantDetails.commonName}"
    />
    {#if parent1}
      <div class="parent1">
        <img src={parent1.imageUrl} alt="parent 1" />
        <h1>{parent1.commonName}</h1>
        <button on:click={() => updatePlantDetails(parent1)}> See </button>
      </div>
    {/if}
    {#if parent2}
      <div class="parent2">
        <img src={parent2.imageUrl} alt="parent 2" />
        <h2>{parent2.commonName}</h2>
        <button on:click={() => updatePlantDetails(parent2)}> See </button>
      </div>
    {/if}
    <br />
    <p class="text-3xl font-bold text-center text-blue-600">
      {plantDetails.commonName}
    </p>
    <br />
    <p class="text-blue-600 font-semibold ml-4">
      {plantDetails.description}
    </p>
  </div>
</div>

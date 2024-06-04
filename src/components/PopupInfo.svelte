<script lang="ts">
  import type { SelectPlant } from "$lib/types";

  export let allSeeds: SelectPlant[];

  export let plantDetails: SelectPlant;

  type PlantProperties = { [key: string]: string | number };

  const plantProperties = plantDetails.properties as PlantProperties;

  export let closePopup: () => any;

  let parent1 = allSeeds.find((plant) => plant.id === plantDetails.parent1);
  let parent2 = allSeeds.find((plant) => plant.id === plantDetails.parent2);

  function updatePlantDetails(plant: SelectPlant) {
    plantDetails = plant;
    parent1 = allSeeds.find((plant) => plant.id === plantDetails.parent1);
    parent2 = allSeeds.find((plant) => plant.id === plantDetails.parent2);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="fixed top-0 left-0 right-0" on:click={closePopup}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="border bg-slate-100 m-8 p-4 rounded" on:click|stopPropagation>
    <div>
      <button
        type="button"
        class="bg-transparent hover:bg-slate-500 text-slate-700 font-semibold hover:text-white py-2 px-4 border border-slate-500 hover:border-transparent rounded"
        on:click={closePopup}
        aria-label="Close popup">Close &times;</button
      >
    </div>
    <img
      class="md:max-w-20"
      src={plantDetails.imageUrl}
      alt="Drawing of a {plantDetails.commonName}"
    />
    {#if parent1}
      <div class="parent1">
        <img src={parent1.imageUrl} alt="parent 1" />
        <h1>{parent1.commonName}</h1>
        <button
          on:click={() => {
            if (parent1) {
              updatePlantDetails(parent1);
            }
          }}
        >
          See
        </button>
      </div>
    {/if}
    {#if parent2}
      <div class="parent2">
        <img src={parent2.imageUrl} alt="parent 2" />
        <h2>{parent2.commonName}</h2>
        <button
          on:click={() => {
            if (parent2) {
              updatePlantDetails(parent2);
            }
          }}
        >
          See
        </button>
      </div>
    {/if}
    <p>{plantDetails.commonName}</p>
    <p>{plantDetails.description}</p>
  </div>
</div>

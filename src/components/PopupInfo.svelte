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
<div class="overlay" on:click={closePopup}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="popup" on:click|stopPropagation>
    <button
      type="button"
      class="close-button"
      on:click={closePopup}
      aria-label="Close popup">&times;</button
    >
    <br />
    <img
      src={plantDetails.imageUrl}
      alt="Drawing of a {plantDetails.commonName}"
    />
    {#if parent1}
      <div class="parent1">
        <img src={parent1.imageUrl} alt="parent 1" />
        <p>{parent1.commonName}</p>
        <button on:click={() => updatePlantDetails(parent1)}> See </button>
      </div>
    {/if}
    {#if parent2}
      <div class="parent2">
        <img src={parent2.imageUrl} alt="parent 2" />
        <p>{parent2.commonName}</p>
        <button on:click={() => updatePlantDetails(parent2)}> See </button>
      </div>
    {/if}
    <p>{plantDetails.commonName}</p>
    <p>{plantDetails.description}</p>
    <p>
      The {plantDetails.commonName} has {plantProperties["petalCountRange"]}
      {plantProperties["flowerColour"]} petals
    </p>
  </div>
</div>

<style>
  @import "./popups.css";
</style>

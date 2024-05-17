<script lang="ts">
  import type { SelectPlant } from "$lib/types";

  export let plantDetails: SelectPlant;

  type PlantProperties = { [key: string]: string | number };

  const plantProperties = plantDetails.properties as PlantProperties;

  export let closePopup: () => any;
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

  .close-button {
    position: absolute;
    top: -3%; /* Haut de l'élément conteneur */
    right: 0%; /* Droite de l'élément conteneur */
    border: none;
    background: none;
    font-size: 24px;
    cursor: pointer;
  }
</style>

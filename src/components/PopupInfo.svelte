<script>
  export let plantDetails;
  export let closePopup;
</script>

{#if plantDetails}
  <div class="overlay">
    <div class="popup">
      <button on:click={closePopup}>Fermer</button>
      <br />
      <img
        src={plantDetails.imageUrl}
        alt="Drawing of a {plantDetails.commonName}"
      />
      <p>{plantDetails.commonName}</p>
      <p>{plantDetails.description}</p>
      <p>
        The {plantDetails.commonName} has {plantDetails.properties
          .petalCountRange}
        {plantDetails.properties.flowerColour} petals
      </p>
    </div>
  </div>
{/if}

<style>
  @import "./popups.css";
</style>

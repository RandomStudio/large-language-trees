<script lang="ts">
  import { onMount } from 'svelte';

  let words = null; // Initialize as null to indicate loading state
  let error = null;

  async function fetchData() {
    try {
      const response = await fetch('src/defaults/seeds.json');
      const data = await response.json(); // Parse the JSON response

      // Get the first object in the array
      const firstItem = data[0];

      // Assign values to individual variables
      const { id: wordID, commonName: wordCOMMONNAME, characteristics, description } = firstItem;
      const { fruit: wordFRUIT, flowerColour: wordCOLOUR, petalShape: wordPETALSHAPE, leafShape: wordLEAFSHAPE } = characteristics;

      // Assign values to the words object
      words = {
        id: wordID,
        commonName: wordCOMMONNAME,
        characteristics: {
          fruit: wordFRUIT,
          flowerColour: wordCOLOUR,
          petalShape: wordPETALSHAPE,
          leafShape: wordLEAFSHAPE
        },
        description: description
      };
    } catch (err) {
      error = err.message;
    }
  }

  // Call fetchData when the component is mounted
  onMount(fetchData);
</script>

{#if error}
  <p>Error: {error}</p>
{:else if words === null}
  <p>Loading...</p>
{:else}
  <!-- Display your content here -->
{/if}

<!-- Flower drawing goes here! -->

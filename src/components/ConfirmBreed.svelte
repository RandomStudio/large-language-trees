<script lang="ts">
  import type { InsertPlant, SelectPlant } from "$lib/types";

  export let candidateChild: InsertPlant;

  export let closePopup: () => any;
</script>

<div class="overlay">
  <div class="popup">
    <h1>New plant!</h1>
    <p>
      Details: <code>{JSON.stringify(candidateChild)}</code>
    </p>
    <div>
      <button>✅ Add </button>
      <button on:click={closePopup}>❌ Cancel</button>
    </div>
  </div>
</div>

<style>
  @import "./popups.css";
</style>

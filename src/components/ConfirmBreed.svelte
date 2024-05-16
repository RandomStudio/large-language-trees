<script lang="ts">
  import type { InsertPlant, SelectPlant } from "$lib/types";

  export let candidateChild: InsertPlant;
</script>

<div class="overlay">
  <div class="popup">
    <button>Close</button>
    <h1>New plant!</h1>
    <p>
      Details: <code>{JSON.stringify(candidateChild)}</code>
    </p>
  </div>
</div>

<style>
  @import "./popups.css";
</style>

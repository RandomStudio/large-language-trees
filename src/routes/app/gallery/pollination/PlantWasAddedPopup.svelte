<script lang="ts">
  import type { InsertPlant } from "$lib/types";

  export let plant: InsertPlant;
</script>

<div
  class="border-2 border-solid border-red-500 w-screen h-screen p-4 m-4 fixed top-0 left-0 bg-slate-600"
>
  <h1>You got a new plant!</h1>

  <div>
    {plant.commonName}
  </div>
</div>

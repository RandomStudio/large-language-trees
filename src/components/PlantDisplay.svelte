<script lang="ts">
  import type { SelectPlant } from "$lib/types";

  export let plant: SelectPlant;
  export let applyFilters: boolean = false;
  export let width: string = "w-full"; // Default width, can be overridden
</script>

<div class="flex flex-col items-center">
  <canvas id={"canvas_" + plant.commonName} style="display:none;"></canvas>
  <!-- svelte-ignore a11y-img-redundant-alt -->
  <img
    src={plant.imageUrl}
    alt={plant.commonName}
    id={plant.commonName}
    class={width}
    class:filter={applyFilters}
    class:grayscale={applyFilters}
    class:opacity-50={applyFilters}
  />
  <p class="text-roel_blue font-inter text-xl">
    {plant.commonName}
  </p>
</div>

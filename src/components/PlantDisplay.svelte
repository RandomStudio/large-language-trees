<script lang="ts">
  import type { SelectPlant } from "$lib/types";

  export let plant: SelectPlant;
  export let applyFilters: boolean = false;
  export let width: string = "w-full"; // Default width, can be overridden
</script>

<div class="text-center">
  <img
    src={plant.imageUrl}
    alt={plant.commonName}
    id={plant.commonName}
    class={width}
    class:filter={applyFilters}
    class:grayscale={applyFilters}
    class:opacity-70={applyFilters}
    class:mix-blend-multiply={applyFilters}
  />
  <p class="text-roel_blue font-inter text-xl">
    {plant.commonName}
  </p>
</div>

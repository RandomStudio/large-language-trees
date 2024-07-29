<script lang="ts">
  import type { SelectPlant } from "$lib/types";
  import { page } from "$app/stores";

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
    class:opacity-65={applyFilters}
    class:contrast-200={applyFilters}
    class:mix-blend-difference={applyFilters}
  />
  {#if $page.url.pathname !== "/startwindow"}
    <p class="text-roel_blue font-primer text-3xl">
      {plant.commonName}
    </p>
  {/if}
</div>

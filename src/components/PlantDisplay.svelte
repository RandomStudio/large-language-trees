<script lang="ts">
  import type { SelectPlant } from "$lib/types";
  import { page } from "$app/stores";
  import AnimatedPlant from "../components/AnimatedPlant.svelte";

  export let plant: SelectPlant;
  export let applyFilters: boolean = false;
  export let positionStyles: string = "w-full"; // Default width, can be overridden
</script>

<div class="text-center">
  <AnimatedPlant
    imageURL={plant.imageUrl || ""}
    {applyFilters}
    {positionStyles}
  />
  {#if $page.url.pathname !== "/app/startwindow"}
    <p class="text-roel_blue font-primer text-3xl">
      {plant.commonName}
    </p>
  {/if}
</div>

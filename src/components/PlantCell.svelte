<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import type { SelectPlant } from "../lib/types";

  export let data: SelectPlant;
  export let gridIndex: number;

  const dispatchDragStart = createEventDispatcher();

  // Reactive variable for scaling
  let scaleClass = "scale-100";

  // Function to toggle scale randomly
  function toggleScale() {
    scaleClass = Math.random() < 0.5 ? "scale-100" : "scale-125"; // Randomly toggle scale
  }

  onMount(() => {
    const interval = setInterval(toggleScale, 2000); // Change scale every 2 seconds
    return () => clearInterval(interval); // Cleanup on component destruction
  });
</script>

<!-- Plant component with scaled and adjusted image for full visibility -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  draggable={true}
  class="relative w-full h-full overflow-hidden"
  on:dragstart={(e) => {
    dispatchDragStart("dragStart", { e, gridIndex });
  }}
>
  <div class="absolute w-full z-20">
    <h1 class="text-center">
      {data.commonName}
    </h1>
  </div>
  {#if data.imageUrl}
    <img
      class="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] {scaleClass} z-10"
      src={data.imageUrl}
      alt="the real plant"
    />
  {:else}
    <img
      class="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] {scaleClass} z-10"
      src="/plants/placeholder.png"
      alt="placeholder"
    />
  {/if}
</div>

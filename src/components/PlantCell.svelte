<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { SelectPlant } from "../lib/types";

  export let data: SelectPlant;
  export let gridIndex: number;

  const dispatchDragStart = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="cell"
  draggable={true}
  on:dragstart={(e) => {
    dispatchDragStart("dragStart", { e, gridIndex });
  }}
>
  <div class="draggable">
    {#if data.imageUrl}
      <img src={data.imageUrl} alt="the real plant" class="thumbnail" />
    {:else}
      <img src="/plants/placeholder.png" alt="placeholder" class="thumbnail" />
    {/if}
    <div class="plant-name">
      {data.commonName}
    </div>
  </div>
</div>

<style>
  .cell {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .thumbnail {
    width: 100%;
    height: 100%;
  }

  .plant-name {
    position: absolute;
    top: 0;
  }
</style>

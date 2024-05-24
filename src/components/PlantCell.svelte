<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { SelectPlant } from "../lib/types";

  export let data: SelectPlant;
  export let gridIndex: number;

  const dispatchDragStart = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  draggable={true}
  on:dragstart={(e) => {
    dispatchDragStart("dragStart", { e, gridIndex });
  }}
>
  <div class="relative">
    <div class="absolute w-full">
      <h1 class="text-center">
        {data.commonName}
      </h1>
    </div>
  </div>
  {#if data.imageUrl}
    <img src={data.imageUrl} alt="the real plant" />
  {:else}
    <img src="/plants/placeholder.png" alt="placeholder" />
  {/if}
</div>

<style>
</style>

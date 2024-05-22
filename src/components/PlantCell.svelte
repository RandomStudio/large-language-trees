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
    position: relative; /* Nécessaire pour le positionnement absolu des éléments à l'intérieur */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .draggable {
    width: 100%;
    position: relative; /* Nécessaire pour positionner correctement l'image */
    overflow: visible; /* Permet à l'image de dépasser */
  }

  .thumbnail {
    position: absolute;
    width: 120%; /* Agrandir l'image à 120% de sa cellule */
    left: 50%; /* Centrer horizontalement */
    transform: translate(
      -50%,
      -50%
    ); /* Ajustement pour le centrage vertical et horizontal */
    height: auto; /* Garder le ratio de l'image */
    top: 50%; /* Centrer verticalement */
  }

  .plant-name {
    display: none; /* Initially hidden */
    position: absolute;
    top: calc(100% + 13px);
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6em;
    white-space: nowrap;
    overflow: visible;
  }

  .draggable:hover .plant-name {
    display: block; /* Show on hover */
  }
</style>

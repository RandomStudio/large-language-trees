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
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .thumbnail {
    width: 120%;
    height: auto;
  }

  .draggable {
    width: 90%; /* Ajustez selon la taille souhaitée pour l'image et le texte */
    text-align: center; /* Centrage du texte à l'intérieur de draggable */
  }

  .plant-name {
    position: absolute;
    top: 80%; /* Positionner juste en dessous de l'image */
    width: 100%; /* Permettre au texte de s'étendre sur toute la largeur */
    text-align: center; /* Centrer le texte horizontalement */
    font-size: 0.4em; /* Taille de la police plus petite */
  }
</style>

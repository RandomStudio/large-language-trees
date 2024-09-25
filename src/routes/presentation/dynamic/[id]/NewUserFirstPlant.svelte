<script lang="ts">
  import { onMount } from "svelte";
  import { getColourPair } from "./findColors";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import type { SelectPlant } from "$lib/types";

  export let plant: SelectPlant;
  export let gardenerName: string;

  export let applyFilters: boolean = false;

  let brightColor: string | null = null;
  let darkColor: string | null = null;

  let img: HTMLImageElement;

  onMount(() => {
    img.onload = () => {
      const result = getColourPair(img);
      brightColor = result.brightColor;
      darkColor = result.darkColor;
    };
  });
</script>

<div
  class="w-full h-full"
  style="background: linear-gradient({darkColor}, {brightColor});"
>
  <div
    class="absolute w-full h-full flex text-center items-start justify-center text-6xl pt-32 font-gyst"
    style="color: {brightColor};"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plant.commonName.toUpperCase()}
  </div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img
      class="hidden"
      src={plant.imageUrl}
      alt={plant.commonName}
      bind:this={img}
      crossorigin="anonymous"
    />
    <div class="absolute w-full h-full flex items-center justify-center">
      <PlantDisplay imageUrl={plant.imageUrl || ""} {applyFilters} />
    </div>
  </div>

  <div
    class="w-full text-center text-6xl font-gyst absolute bottom-32 z-10"
    style="color: {darkColor};"
  >
    <div>Just sprouted</div>
    <div>in the garden!</div>
  </div>
</div>

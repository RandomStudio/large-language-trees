<script lang="ts">
  import type { SelectPlant } from "$lib/types";
  import { onMount } from "svelte";

  export let plant: SelectPlant;
  export let width: string;
</script>

<div class="flex justify-center">
  <canvas id={"canvas_" + plant.commonName} style="display:none;"></canvas>
  <!-- svelte-ignore a11y-img-redundant-alt -->
  <img
    src={plant.imageUrl}
    alt={plant.commonName}
    {width}
    id={plant.commonName}
  />
</div>
<p class="flex justify-center text-roel_blue">
  {plant.commonName}
</p>

<script lang="ts">
  import type { SelectPlant } from "$lib/types";

  export let plant: SelectPlant;
</script>

<div class="flex justify-center">
  <canvas id={"canvas_" + plant.commonName} style="display:none;"></canvas>
  <!-- svelte-ignore a11y-img-redundant-alt -->
  <img
    src={plant.imageUrl}
    alt={plant.commonName}
    id={plant.commonName}
    class="max-w-20"
  />
</div>
<p class="flex justify-center text-roel_blue">
  {plant.commonName}
</p>

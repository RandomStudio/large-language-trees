<script lang="ts">
    import { canvaWithoutBG } from "$lib/removeBG";
    import type { SelectPlant } from "$lib/types";
    import { onMount } from "svelte";

    export let plant: SelectPlant;
    export let width: string;
    export let index: number; // Add index prop

    onMount(() => {
        if (plant.commonName != null && plant.imageUrl != null) {
            canvaWithoutBG(
                "canvas_" + plant.commonName,
                plant.commonName,
                plant.imageUrl,
            );
        }
    });
</script>

<div class="flex justify-center">
    <canvas id={"canvas_" + plant.commonName} style="display:none;"></canvas>
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <img
        class={index > 0 ? "grayscale opacity-80" : ""}
        src={plant.imageUrl}
        alt={plant.commonName}
        {width}
        id={plant.commonName}
    />
</div>
<p class="flex justify-center text-roel_blue">
    {plant.commonName}
</p>

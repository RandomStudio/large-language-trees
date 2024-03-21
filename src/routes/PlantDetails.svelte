<script lang="ts">
    import type { Plant } from "./types";
    import FlowerDrawing from "./FlowerDrawing.svelte";

    export let plantDetails: Plant;
</script>

<div class="plant">
    <h2>
        {plantDetails.commonName}
    </h2>
    <div class="subtitle">
        {plantDetails.id}
    </div>
    <!-- <code>{JSON.stringify(props)}</code> -->
    <ul>
        {#each Object.entries(plantDetails.characteristics) as [key, value]}
            <li>{key}: {value}</li>
            <!-- <li>{item}</li> -->
        {/each}
    </ul>
    <p>{plantDetails.description}</p>
    <FlowerDrawing plant={plantDetails} />
</div>

<style>
    .subtitle {
        font-style: italic;
        font-size: 1em;
    }
    li {
        margin: 0;
        list-style-type: none;
    }
</style>

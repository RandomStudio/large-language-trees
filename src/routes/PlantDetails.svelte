<script lang="ts">
    import type { Plant } from "./types";

    export let plantDetails: Plant;
</script>

<div class="plant">
    <h2>
        {plantDetails.commonName}
    </h2>
    <div class="subtitle">
        {plantDetails.id}
    </div>
    {#if plantDetails.parents}
        From: {plantDetails.parents[0]} x {plantDetails.parents[1]}
    {/if}
    <!-- <code>{JSON.stringify(props)}</code> -->
    <ul>
        {#each Object.entries(plantDetails.properties) as [key, value]}
            <li>{key}: {value}</li>
            <!-- <li>{item}</li> -->
        {/each}
    </ul>
    {#if plantDetails.description}
        <p>{plantDetails.description}</p>
    {/if}
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

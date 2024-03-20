<script lang="ts">
    import type { Plant } from "./types";

    export let plantDetails: Plant;
</script>

<div class="plant">
    <div class="col">
        <div class="image-area">
            {#if plantDetails.image}
                <img
                    src={`/plants/${plantDetails.image}`}
                    alt={`generated image of ${plantDetails.commonName}`}
                />
            {:else}
                <button
                    on:click={async () => {
                        await fetch("/api/image", { method: "POST" });
                    }}>Generate an image</button
                >
            {/if}
        </div>
        <h2>
            {plantDetails.commonName}
        </h2>
        <div class="subtitle">
            {plantDetails.id}
        </div>
        <div class="characteristics">
            <ul>
                {#each Object.entries(plantDetails.properties) as [key, value]}
                    <li>{key}: {value}</li>
                    <!-- <li>{item}</li> -->
                {/each}
            </ul>
        </div>
    </div>
    <div class="col">
        {#if plantDetails.parents}
            From: {plantDetails.parents[0]} x {plantDetails.parents[1]}
        {/if}
        <!-- <code>{JSON.stringify(props)}</code> -->

        {#if plantDetails.description}
            <p>{plantDetails.description}</p>
        {/if}
    </div>
</div>

<style>
    p {
        margin-block-start: 0;
    }
    .plant {
        display: flex;
    }
    .subtitle {
        font-style: italic;
        font-size: 1em;
    }
    ul {
        padding: 1em;
        font-size: 0.8em;
    }
    li {
        list-style-type: none;
    }

    .col {
        width: 16em;
        padding: 1em;
    }

    img {
        max-width: 10em;
    }

    .image-area {
        margin-bottom: 2em;
    }
    .plant {
        border-bottom: 1px dashed #ccc;
    }
</style>

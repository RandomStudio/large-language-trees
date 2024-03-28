<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import type { SelectPlant } from "../types";
    import FlowerDrawing from "./FlowerDrawing.svelte";
    import Spinner from "./Spinner.svelte";

    type Plant = SelectPlant;

    interface PlantWithParents extends Plant {
        relatedPlants: SelectPlant[];
    }

    export let plantDetails: Plant;
    export let allowImageGeneration = true;

    let candidateImage: string | null = null;

    let busy = false;
</script>

<div class="plant">
    <div class="col">
        <div class="image-area {allowImageGeneration ? '' : 'hidden'}">
            {#if plantDetails.imageUrl}
                <img
                    src={`/plants/${plantDetails.imageUrl}`}
                    alt={`saved image of ${plantDetails.commonName}`}
                />
            {:else}
                <button
                    on:click={async () => {
                        busy = true;
                        const res = await fetch(`/api/generate/image`, {
                            method: "POST",
                            body: JSON.stringify({
                                description: plantDetails.description,
                                id: plantDetails.id,
                            }),
                        });
                        console.log("got response");
                        busy = false;
                        const json = await res.json();
                        const { url } = json;
                        if (url) {
                            candidateImage = url;
                        }
                    }}
                >
                    Generate an image
                </button>
            {/if}
            {#if candidateImage}
                <img
                    id={`candidate-${plantDetails.id}`}
                    src={candidateImage}
                    alt={`generated image of ${plantDetails.commonName}`}
                />
                <button
                    on:click={async () => {
                        busy = true;
                        await fetch("/api/plants/" + plantDetails.id, {
                            method: "PATCH",
                            body: JSON.stringify({
                                ...plantDetails,
                                imageUrl: plantDetails.id + ".png",
                            }),
                        });
                        candidateImage = null;
                        busy = false;
                        invalidateAll();
                    }}>Save</button
                >
            {/if}
        </div>
        <h2>
            {plantDetails.commonName}
        </h2>
        <div class="subtitle">
            {plantDetails.id}
        </div>
        {#if plantDetails.properties}
            <div class="characteristics">
                <ul>
                    {#each Object.entries(plantDetails.properties) as [key, value]}
                        <li>{key}: {value}</li>
                        <!-- <li>{item}</li> -->
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
    <div class="col">
        <!-- {#if plantDetails.parent1 && plantDetails.parent2}
            <div class="subtitle">
                From:
                <span
                    on:mouseover={() => {
                        console.log("boo!");
                    }}
                >
                    {plantDetails.parent1}
                </span>
                x {plantDetails.parent2}
            </div>
        {/if} -->
        <!-- <code>{JSON.stringify(props)}</code> -->

        {#if plantDetails.description}
            <p>{plantDetails.description}</p>
        {/if}
        <FlowerDrawing plant={plantDetails} />
    </div>
</div>

{#if busy}
    <Spinner />
{/if}

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
        margin-bottom: 1em;
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
        mix-blend-mode: darken;
    }

    .image-area {
        margin-bottom: 2em;
    }
    .hidden {
        display: none;
    }
    .plant {
        border-bottom: 1px dashed #ccc;
    }
</style>

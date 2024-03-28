<script lang="ts">
    import defaults from "../../defaults/prompt-config.json";
    import { buildPrompt } from "./promptUtils";
    import type { InsertPlant, PromptConfig, SelectPlant } from "../../types";
    import PlantDetails from "../PlantDetails.svelte";
    import Spinner from "../Spinner.svelte";

    export let data: {
        parents: [SelectPlant, SelectPlant] | null;
        newSeed: InsertPlant | null;
    };
    const { parents } = data;

    let config = defaults as PromptConfig;

    let busy = false;
</script>

<div class="single container">
    <h3>Prompt Engineering</h3>
    {#if parents}
        We will be combining the following plants:
        {parents[0].commonName} with {parents[1].commonName}
    {/if}
    <p></p>
    <!-- <code>{JSON.stringify(Object.entries(config))}</code> -->
    <form>
        {#each Object.entries(config) as [key, entry]}
            <label>
                {entry.label}
                <textarea name={key} bind:value={entry.text} />
            </label>
        {/each}

        <button
            on:click={async () => {
                if (parents) {
                    busy = true;
                    console.log("Creating...");
                    const res = await fetch("/api/generate/plant", {
                        method: "POST",
                        body: JSON.stringify({
                            prompt: buildPrompt(config, parents[0], parents[1]),
                            parents,
                        }),
                    });
                    busy = false;
                    console.log("...response", res);
                    if (res.ok) {
                        console.log("Success!");
                        data.newSeed = await res.json();
                    } else {
                        console.error("Error!");
                    }
                }
            }}>Create</button
        >
    </form>

    {#if parents}
        <h4>Final text:</h4>
        <p class="small">
            {#each buildPrompt(config, parents[0], parents[1]) as message}
                <p>{message.content}</p>
            {/each}
        </p>
    {/if}

    {#if data.newSeed}
        <h1>How about this specimen?</h1>
        <PlantDetails
            plantDetails={data.newSeed}
            allowImageGeneration={false}
        />
        <form method="POST" action="/">
            <input
                type="hidden"
                name="newSeed"
                value={JSON.stringify(data.newSeed)}
            />
            <input
                type="hidden"
                name="parents"
                value={JSON.stringify(data.parents)}
            />
            <button>Add to my Garden</button>
        </form>
    {/if}
</div>

{#if busy}
    <Spinner />
{/if}

<style>
    .container.single {
        display: block;
    }
    textarea {
        width: 100%;
        min-height: 6em;
    }
    .small {
        font-size: 1em;
        line-height: 1em;
    }
</style>

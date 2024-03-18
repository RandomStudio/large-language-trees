<script lang="ts">
    import { type Plant } from "./types";
    import PlantDetails from "./PlantDetails.svelte";

    export let data: { seeds: Plant[]; newSeed: Plant | null };

    const pick = <T,>(arr: T[]): T => {
        const index = Math.round(Math.random() * (arr.length - 1));
        return arr[index];
    };

    const pickRandomParents = (seeds: Plant[]): [Plant, Plant] => {
        if (seeds.length < 2) {
            throw Error("Input list must have at least 2 entries");
        }
        const first = pick(seeds);
        let second = pick(seeds);
        while (second.id === first.id) {
            second = pick(seeds);
        }
        return [first, second];
    };

    let parents: [Plant, Plant] | null = null;
</script>

<div class="container">
    <div class="page">
        <h1>{data.seeds.length} Seeds</h1>
        <ul class="seeds-list">
            {#each data.seeds as p}
                <li>
                    <PlantDetails props={p} />
                </li>
            {/each}
        </ul>
    </div>

    <div class="interaction">
        <button
            on:click={async () => {
                const seeds = await fetch("/api", { method: "DELETE" });
                data.seeds = await seeds.json();
            }}>Clear all</button
        >
        <button
            on:click={() => {
                parents = pickRandomParents(data.seeds);
            }}>Choose random parents</button
        >
        {#if parents !== null}
            <div class="parents">
                {#each parents as { commonName }, i}
                    "{commonName}" {#if i == 0}<div>x</div>{/if}
                {/each}
            </div>
        {/if}

        {#if parents !== null}
            <input type="hidden" name="parent1" value={parents[0].id} />
            <input type="hidden" name="parent2" value={parents[1].id} />
            <button
                on:click={async () => {
                    const res = await fetch("/api/create", {
                        method: "POST",
                        body: JSON.stringify(parents),
                    });
                    console.log({ res });
                    data.newSeed = await res.json();
                }}>Generate</button
            >
        {/if}

        {#if data.newSeed}
            <h1>How about this specimen?</h1>
            <PlantDetails props={data.newSeed} />
            <form method="POST">
                <input
                    type="hidden"
                    name="newSeed"
                    value={JSON.stringify(data.newSeed)}
                />
                <button>Add to my Garden</button>
            </form>
        {/if}
    </div>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap");

    .container {
        font-family: "Playfair Display", serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
        display: flex;
    }

    .page {
        padding: 3em;
        margin: 3em;
        color: #333;
        max-width: 32em;
        background-color: #ddd;
    }

    h1 {
        font-size: 3em;
        font-weight: 800;
    }

    h2 {
        margin-bottom: 0;
    }

    /* .seeds-list {
        max-width: 50vw;
    } */

    li {
        margin-top: 3em;
        list-style-type: none;
    }

    .interaction {
        margin: 4em;
        padding: 2em 0;
    }

    button {
        cursor: pointer;
        font-family: "Playfair Display", serif;
        font-weight: 800;
        border: 0;
        padding: 1em;
    }

    .parents {
        text-align: center;
        margin: 3em 0;
        font-style: italic;
    }
</style>
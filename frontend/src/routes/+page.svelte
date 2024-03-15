<script lang="ts">
    import { enhance } from "$app/forms";
    import { type Plant } from "./types";
    import { navigating } from "$app/stores";

    export let data: { seeds: Plant[] };

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
    <h1>{data.seeds.length} Seeds</h1>
    <ul class="seeds-list">
        {#each data.seeds as { id, commonName, parents, description }}
            <li>
                <div>
                    <h2>
                        {commonName}
                    </h2>
                    <div class="subtitle">
                        {id}
                    </div>
                    <p>{description}</p>
                </div>
            </li>
        {/each}
    </ul>

    <div class="interaction">
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

        <form method="POST">
            {#if parents !== null}
                <input type="hidden" name="parent1" value={parents[0].id} />
                <input type="hidden" name="parent2" value={parents[1].id} />
                {#if $navigating}
                    <i>Cross-pollinating...</i>
                {:else}
                    <button>Generate</button>
                {/if}
            {/if}
        </form>
    </div>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap");

    .container {
        font-family: "Playfair Display", serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
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

    .subtitle {
        font-style: italic;
        font-size: 1em;
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
        border-top: 1px dashed #ddd;
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

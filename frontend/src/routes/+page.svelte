<script lang="ts">
    import { type Plant } from "./types";
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
</script>

<h1>Garden</h1>
<ul>
    {#each data.seeds as { id, commonName, parents, description }}
        <li>
            <div>
                <h2>#{id}: {commonName}</h2>
                <p>{description}</p>
            </div>
        </li>
    {/each}
</ul>

<form method="POST">
    <button>Generate</button>
</form>

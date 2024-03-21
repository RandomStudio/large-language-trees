<script lang="ts">
    import { type Plant } from "./types";
    import PlantDetails from "./PlantDetails.svelte";
    import FamilyTree from "./FamilyTree.svelte";

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
    <div class="page">
        <h1>{data.seeds.length} Seeds</h1>
        <ul class="seeds-list">
            {#each data.seeds as p}
                <li>
                    <PlantDetails plantDetails={p} />
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
            <form method="POST" action="/create">
                <input
                    type="hidden"
                    name="parents"
                    value={JSON.stringify(parents)}
                />
                <button type="submit">Select</button>
            </form>
        {/if}
        <FamilyTree
            data={[
                [{ id: "Chaos" }],
                [{ id: "Gaea", parents: ["Chaos"] }, { id: "Uranus" }],
                [
                    { id: "Oceanus", parents: ["Gaea", "Uranus"] },
                    { id: "Thethys", parents: ["Gaea", "Uranus"] },
                    { id: "Pontus" },
                    { id: "Rhea", parents: ["Gaea", "Uranus"] },
                    { id: "Cronus", parents: ["Gaea", "Uranus"] },
                    { id: "Coeus", parents: ["Gaea", "Uranus"] },
                    { id: "Phoebe", parents: ["Gaea", "Uranus"] },
                    { id: "Crius", parents: ["Gaea", "Uranus"] },
                    { id: "Hyperion", parents: ["Gaea", "Uranus"] },
                    { id: "Iapetus", parents: ["Gaea", "Uranus"] },
                    { id: "Thea", parents: ["Gaea", "Uranus"] },
                    { id: "Themis", parents: ["Gaea", "Uranus"] },
                    { id: "Mnemosyne", parents: ["Gaea", "Uranus"] },
                ],
                [
                    { id: "Doris", parents: ["Oceanus", "Thethys"] },
                    { id: "Neures", parents: ["Pontus", "Gaea"] },
                    { id: "Dionne" },
                    { id: "Demeter", parents: ["Rhea", "Cronus"] },
                    { id: "Hades", parents: ["Rhea", "Cronus"] },
                    { id: "Hera", parents: ["Rhea", "Cronus"] },
                    { id: "Alcmene" },
                    { id: "Zeus", parents: ["Rhea", "Cronus"] },
                    { id: "Eris" },
                    { id: "Leto", parents: ["Coeus", "Phoebe"] },
                    { id: "Amphitrite" },
                    { id: "Medusa" },
                    { id: "Poseidon", parents: ["Rhea", "Cronus"] },
                    { id: "Hestia", parents: ["Rhea", "Cronus"] },
                ],
                [
                    { id: "Thetis", parents: ["Doris", "Neures"] },
                    { id: "Peleus" },
                    { id: "Anchises" },
                    { id: "Adonis" },
                    { id: "Aphrodite", parents: ["Zeus", "Dionne"] },
                    { id: "Persephone", parents: ["Zeus", "Demeter"] },
                    { id: "Ares", parents: ["Zeus", "Hera"] },
                    { id: "Hephaestus", parents: ["Zeus", "Hera"] },
                    { id: "Hebe", parents: ["Zeus", "Hera"] },
                    { id: "Hercules", parents: ["Zeus", "Alcmene"] },
                    { id: "Megara" },
                    { id: "Deianira" },
                    { id: "Eileithya", parents: ["Zeus", "Hera"] },
                    { id: "Ate", parents: ["Zeus", "Eris"] },
                    { id: "Leda" },
                    { id: "Athena", parents: ["Zeus"] },
                    { id: "Apollo", parents: ["Zeus", "Leto"] },
                    { id: "Artemis", parents: ["Zeus", "Leto"] },
                    { id: "Triton", parents: ["Poseidon", "Amphitrite"] },
                    { id: "Pegasus", parents: ["Poseidon", "Medusa"] },
                    { id: "Orion", parents: ["Poseidon"] },
                    { id: "Polyphemus", parents: ["Poseidon"] },
                ],
                [
                    { id: "Deidamia" },
                    { id: "Achilles", parents: ["Peleus", "Thetis"] },
                    { id: "Creusa" },
                    { id: "Aeneas", parents: ["Anchises", "Aphrodite"] },
                    { id: "Lavinia" },
                    { id: "Eros", parents: ["Hephaestus", "Aphrodite"] },
                    { id: "Helen", parents: ["Leda", "Zeus"] },
                    { id: "Menelaus" },
                    { id: "Polydueces", parents: ["Leda", "Zeus"] },
                ],
                [
                    { id: "Andromache" },
                    { id: "Neoptolemus", parents: ["Deidamia", "Achilles"] },
                    { id: "Aeneas(2)", parents: ["Creusa", "Aeneas"] },
                    { id: "Pompilius", parents: ["Creusa", "Aeneas"] },
                    { id: "Iulus", parents: ["Lavinia", "Aeneas"] },
                    { id: "Hermione", parents: ["Helen", "Menelaus"] },
                ],
            ]}
        />
    </div>
</div>

<style>
    .page {
        padding: 3em;
        margin: 0;
        color: #333;
        max-width: 50%;
        background-color: #ddd;
    }

    li {
        margin-top: 3em;
        list-style-type: none;
    }

    .interaction {
        max-width: 32em;
        margin: 4em;
        padding: 2em 0;
    }

    .parents {
        text-align: center;
        margin: 3em 0;
        font-style: italic;
    }
</style>

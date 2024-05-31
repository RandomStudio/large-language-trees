<script lang="ts">
    import { goto } from "$app/navigation";
    import {
        type SeedbankEntryWithPlant,
        type GardenViewData,
        type MyGarden,
    } from "../../lib/types"; // Adjust the import paths as necessary

    export let data: GardenViewData;

    import PlantDisplay from "../../components/PlantDisplay.svelte";

    let selectedPlant = data.seedBank.plantsInSeedbank[0].plant;
</script>

<div class="min-h-screen bg-roel_green overflow-hidden">
    <main class="mx-10 mt-20">
        <div class="text-left">
            {#if selectedPlant}
                <PlantDisplay plant={selectedPlant} width="70%"></PlantDisplay>
                <p class="text-roel_blue">
                    {selectedPlant.description}
                </p>
            {:else}
                <p class="text-roel_blue">No plants available</p>
            {/if}
        </div>
        <br />
        <p class="text-roel_blue">
            Find a fellow gardener irl and scan their barcode to start
            pollinating.
        </p>

        <div class="mt-4 text-center">
            <button
                class="bg-transparent text-roel_blue py-2 px-4 border-2 border-blue-500 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
                style="width:250px;"
                on:click={() => goto("/seeds_bank")}
            >
                Start Pollinating
            </button>
        </div>
    </main>
</div>

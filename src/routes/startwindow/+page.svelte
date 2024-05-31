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
    <div class="fixed top-10 left-10">
        <h1 class="text-3xl text-roel_blue">The Garden</h1>
    </div>

    <main class="mx-10 mt-20">
        <p class="text-roel_blue text-2xl">
            Dear aspiring gardener, We have selected a plant for you!
        </p>
        <div class="text-left">
            {#if selectedPlant}
                <PlantDisplay plant={selectedPlant} width="70%"></PlantDisplay>
            {:else}
                <p class="text-roel_blue">No plants available</p>
            {/if}
        </div>

        <div class="mt-4 text-center">
            <button
                class="bg-transparent text-roel_blue py-2 px-4 border-2 border-blue-500 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
                style="width:250px;"
                on:click={() => goto("/afterstartwindow")}
            >
                Great!
            </button>
        </div>
    </main>
</div>

<style>
    @font-face {
        font-family: "Garamond";
        src: url("/Garamond.ttf") format("truetype");
        font-weight: normal;
        font-style: normal;
    }

    h1 {
        font-family: "Garamond", serif;
    }
</style>

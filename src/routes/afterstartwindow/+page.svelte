<script lang="ts">
    import { goto } from "$app/navigation";
    import {
        type SeedbankEntryWithPlant,
        type MyGarden,
    } from "../../lib/types"; // Adjust the import paths as necessary

    interface GardenViewData {
        seeds: SeedbankEntryWithPlant[];
        username: string;
        garden: MyGarden;
    }

    export let data: GardenViewData;

    console.log(data.seeds);

    // Automatically select the first plant in the list to display
    let selectedPlant = data.seeds.length > 0 ? data.seeds[0].plant : null;
</script>

<div class="min-h-screen bg-roel_green overflow-hidden">
    <div class="fixed top-10 left-10">
        <h1 class="text-3xl text-roel_blue">The Garden</h1>
    </div>

    <main class="mx-10 mt-20">
        <div class="text-left">
            {#if selectedPlant}
                <div class="flex justify-center my-4">
                    <img
                        src={selectedPlant.imageUrl}
                        alt={selectedPlant.commonName}
                        style="width: 100%;"
                    />
                </div>
                <p class="flex justify-center text-roel_blue">
                    {selectedPlant.commonName}
                </p>
            {:else}
                <p class="text-roel_blue">No plants available</p>
            {/if}
        </div>
        <br />
        <p class="text-roel_blue text-2xl">
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

<style>
    @font-face {
        font-family: "Garamond";
        src: url("/static/Garamond.ttf") format("truetype");
        font-weight: normal;
        font-style: normal;
    }

    h1 {
        font-family: "Garamond", serif;
    }
</style>

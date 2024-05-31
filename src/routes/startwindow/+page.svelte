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

<main class="mx-10 mt-20">
    <p class="text-roel_blue">
        Dear aspiring gardener, We have selected a plant for you!
    </p>
    <div class="text-left">
        {#if selectedPlant}
            <div class="flex justify-center my-4">
                <img
                    src={selectedPlant.imageUrl}
                    alt={selectedPlant.commonName}
                    style="width: 50%;"
                />
            </div>
            <p class="flex justify-center text-roel_blue">
                {selectedPlant.commonName}
            </p>
            <p class="text-roel_blue">
                {selectedPlant.description}
            </p>
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

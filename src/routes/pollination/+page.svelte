<script lang="ts">
    import {
        type GardenPlantEntry,
        type InsertPlant,
        type MyGarden,
        type SeedbankEntryWithPlant,
        type SelectPlant,
    } from "../../lib/types"; // Assuming type import is correct

    interface GardenViewData {
        seeds: SeedbankEntryWithPlant[];
        username: string;
        garden: MyGarden;
    }

    export let data: GardenViewData;

    let selectedPlant: SelectPlant | null = null;

    console.log(data.seeds);
    import QrGenerate from "../../components/qr_generate.svelte";

    import { onMount } from "svelte";
    import {
        BrowserMultiFormatReader,
        NotFoundException,
    } from "@zxing/library";
    import type { Result } from "postcss";

    let videoElement: string | HTMLVideoElement | null;
    let parent2: string;

    let parent1 = data.seeds[0].plantId;

    onMount(() => {
        const codeReader = new BrowserMultiFormatReader();

        codeReader.decodeFromVideoDevice(null, videoElement, (result, err) => {
            if (result) {
                // Handle the result here
                console.log(result.getText());
                parent2 = result.getText();
            }
            if (err && !(err instanceof NotFoundException)) {
                console.error(err);
            }
        });

        return () => {
            codeReader.reset();
        };
    });
</script>

<main
    class="flex flex-col items-center justify-center min-h-screen bg-green-300"
>
    <div class="w-full">
        <h1 class="text-3xl font-bold text-blue-600 ml-4">The Garden</h1>
    </div>
    <br />
    <p class="text-2xl text-blue-600 ml-4">
        Point your camera to another gardeners
    </p>
    <video
        bind:this={videoElement}
        class="w-full aspect-video md:aspect-square"
    >
        <track kind="captions" srclang="en" label="English captions" />
    </video>

    <p aria-live="polite">{parent2}</p>

    <QrGenerate text={parent1}></QrGenerate>

    <p>{parent1} and {parent2} will Crossbreed</p>
</main>

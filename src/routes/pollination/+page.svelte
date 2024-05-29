<script lang="ts">
    import {
        type GardenPlantEntry,
        type GardenPlantEntryWithPlant,
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

    console.log(data.garden.plantsInGarden);

    function findPlantById(
        plants: GardenPlantEntryWithPlant[],
        plantId: string,
    ): SelectPlant | undefined {
        return plants.find((plant) => plant.plantId === plantId);
    }

    import QrGenerate from "../../components/qr_generate.svelte";
    import { goto } from "$app/navigation";
    import Grid from "../garden/+page.svelte";
    import { onMount } from "svelte";
    import {
        BrowserMultiFormatReader,
        NotFoundException,
    } from "@zxing/library";

    let videoElement: HTMLVideoElement;

    let parent1Id = data.seeds[0].plantId;
    let parent2Id: string = "";

    $: candidateParentsFirst = [
        findPlantById(data.garden.plantsInGarden, parent1Id),
        findPlantById(data.garden.plantsInGarden, parent2Id),
    ];

    console.log(parent1Id);

    onMount(() => {
        const codeReader = new BrowserMultiFormatReader();

        const constraints = {
            video: {
                facingMode: { exact: "user" }, // Utiliser la caméra frontale
            },
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
                videoElement.srcObject = stream;
                videoElement.setAttribute("playsinline", true); // Required to tell iOS safari we don't want fullscreen
                videoElement.play();
                codeReader.decodeFromStream(
                    stream,
                    videoElement,
                    (result, err) => {
                        if (result) {
                            // Handle the result here
                            console.log(result.getText());
                            parent2Id = result.getText();
                        }
                        if (err && !(err instanceof NotFoundException)) {
                            console.error(err);
                        }
                    },
                );
            })
            .catch((err) => {
                console.error(err);
            });

        return () => {
            codeReader.reset();
        };
    });

    function navigate() {
        // Supposons que vous voulez passer des paramètres à la page de destination
        goto("/some-page?param=value");
    }
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

    <p aria-live="polite">{parent2Id}</p>

    <QrGenerate text={parent1Id}></QrGenerate>

    <p>{parent1Id} and {parent2Id} will Crossbreed</p>

    {#if candidateParentsFirst[1] && candidateParentsFirst[0]}
        <Grid {candidateParentsFirst} pollination={true} {data}></Grid>
    {/if}
</main>

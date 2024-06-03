<script lang="ts">
    import {
        type GardenPlantEntryWithPlant,
        type MyGarden,
        type SeedbankEntryWithPlant,
        type SelectPlant,
        type GardenViewData,
    } from "../../lib/types"; // Assuming type import is correct

    import QrGenerate from "../../components/qr_generate.svelte";
    import { goto } from "$app/navigation";
    import Pollinate from "../garden/+page.svelte";
    import { onMount } from "svelte";
    import {
        BrowserMultiFormatReader,
        NotFoundException,
    } from "@zxing/library";

    export let data: GardenViewData;

    let parent1Id = data.seedBank.plantsInSeedbank[0].plant.id;
    let parent2Id: string = "";

    function findPlantById(
        plants: GardenPlantEntryWithPlant[],
        plantId: string,
    ) {
        return plants.find((plant) => plant.plantId === plantId);
    }

    let videoElement: HTMLVideoElement;

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
                videoElement.setAttribute("playsinline", "true"); // Required to tell iOS safari we don't want fullscreen
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
</script>

<main
    class="flex flex-col items-center justify-center min-h-screen bg-green-300"
>
    <br />
    <p class="text-2xl text-blue-600 ml-4">Scan another plant to pollinate</p>
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
        <Pollinate {candidateParentsFirst} pollination={true} {data}
        ></Pollinate>
    {/if}
</main>

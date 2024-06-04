<script lang="ts">
    import {
        type GardenPlantEntryWithPlant,
        type MyGarden,
        type SeedbankEntryWithPlant,
        type SelectPlant,
        type GardenViewData,
        type InsertPlant,
    } from "../../lib/types"; // Assuming type import is correct

    import QrGenerate from "../../components/qr_generate.svelte";
    import { goto } from "$app/navigation";
    import { addNewPlant, confirmBreed } from "$lib/confirmBreed";
    import { onMount } from "svelte";
    import {
        BrowserMultiFormatReader,
        NotFoundException,
    } from "@zxing/library";
    import ConfirmBreedPopup from "../../components/ConfirmBreedPopup.svelte";
    import PopupInfo from "../../components/PopupInfo.svelte";

    export let data: GardenViewData;

    let parent1: SelectPlant | null =
        data.seedBank.plantsInSeedbank.find(
            (plant) =>
                plant.plant.parent1 == null && plant.plant.parent2 == null,
        )?.plant || null;

    let parent2: SelectPlant | null = null;

    let candidateChild: InsertPlant | null = null;

    let child: SelectPlant | null = null;

    function findPlantById(
        plants: GardenPlantEntryWithPlant[],
        plantId: string,
    ) {
        return plants.find((plant) => plant.plantId === plantId);
    }

    function existingChild(
        plant1: SelectPlant | null,
        plant2: SelectPlant | null,
    ) {
        if (plant1 && plant2) {
            if (
                data.seedBank.plantsInSeedbank.find(
                    (plant) =>
                        (plant.plant.parent1 == plant1.id &&
                            plant.plant.parent2 == plant2.id) ||
                        (plant.plant.parent2 == plant1.id &&
                            plant.plant.parent1 == plant2.id),
                )
            ) {
                return data.seedBank.plantsInSeedbank.find(
                    (plant) =>
                        (plant.plant.parent1 == plant1.id &&
                            plant.plant.parent2 == plant2.id) ||
                        (plant.plant.parent2 == plant1.id &&
                            plant.plant.parent1 == plant2.id),
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    let videoElement: HTMLVideoElement;

    onMount(() => {
        const codeReader = new BrowserMultiFormatReader();

        const constraints = {
            video: {},
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
                            const parent2Id = result.getText();
                            fetch("/api/plants/" + parent2Id).then(
                                async (res) => {
                                    if (res.status == 200) {
                                        parent2 = await res.json();
                                        if (parent1 && parent2) {
                                            if (
                                                existingChild(parent1, parent2)
                                            ) {
                                                child = existingChild(
                                                    parent1,
                                                    parent2,
                                                )?.plant;
                                                console.log(child);
                                            } else {
                                                console.log("coucou");
                                                candidateChild =
                                                    await confirmBreed([
                                                        parent1,
                                                        parent2,
                                                    ]);
                                            }
                                        }
                                    }
                                },
                            );
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

    console.log(parent1);
    console.log(parent2);
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

    {#if parent1}
        <QrGenerate text={parent1.id}></QrGenerate>
    {/if}

    {#if parent2}
        <p>{parent2.id}</p>
    {/if}

    {#if candidateChild}
        <ConfirmBreedPopup
            {candidateChild}
            onCancel={() => {
                candidateChild = null;
            }}
            onConfirm={async () => {
                if (candidateChild) {
                    await addNewPlant(
                        candidateChild,
                        data.garden.id,
                        data.seedBank.id,
                    );
                    candidateChild = null;
                }
            }}
        />
    {/if}

    {#if child}
        <PopupInfo
            allSeeds={data.seedBank.plantsInSeedbank.map((s) => s.plant)}
            plantDetails={child}
            closePopup={() => {
                child = null;
            }}
        />
    {/if}
</main>

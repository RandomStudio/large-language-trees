<script lang="ts">
  import {
    type SelectPlant,
    type GardenViewData,
    type InsertPlant,
  } from "../../lib/types"; // Assuming type import is correct

  import QrGenerate from "../../components/qr_generate.svelte";
  import { addNewPlant, confirmBreed } from "$lib/confirmBreed";
  import { onMount } from "svelte";
  import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
  import ConfirmBreedPopup from "../../components/ConfirmBreedPopup.svelte";
  import PopupInfo from "../../components/PopupInfo.svelte";

  export let data: GardenViewData;
  let busy = false;

  let parent1: SelectPlant | null =
    data.seedBank.plantsInSeedbank.find(
      (plant) => plant.plant.parent1 == null && plant.plant.parent2 == null
    )?.plant || null;

  let parent2: SelectPlant | null = null;

  let candidateChild: InsertPlant | null = null;

  let child: SelectPlant | null = null;

  const existingChild = (
    parents: [SelectPlant, SelectPlant]
  ): SelectPlant | null =>
    data.seedBank.plantsInSeedbank.find(
      (plant) =>
        parents.find((p) => p.id == plant.plant.parent1) ||
        parents.find((p) => p.id == plant.plant.parent2)
    )?.plant || null;

  let videoElement: HTMLVideoElement;

  onMount(async () => {
    const codeReader = new BrowserMultiFormatReader();

    const constraints = {
      video: {},
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    videoElement.srcObject = stream;
    videoElement.setAttribute("playsinline", "true"); // Required to tell iOS safari we don't want fullscreen
    videoElement.play();

    codeReader.decodeFromStream(stream, videoElement, (result, err) => {
      if (result && !busy) {
        // Handle the result here
        busy = true;
        console.log(result.getText());
        const parent2Id = result.getText();
        fetch("/api/plants/" + parent2Id).then(async (res) => {
          if (res.status == 200) {
            parent2 = await res.json();
            if (parent1 && parent2) {
              child = existingChild([parent1, parent2]);
              console.log(child);
              if (child == null) {
                candidateChild = await confirmBreed([parent1, parent2]);
              }
            }
          }
        });
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
        busy = false;
      }
    });
  });
</script>

<main class="mx-14 mt-20">
  <br />
  <p class="text-roel_blue font-garamond text-3xl mb-6">
    Scan another plant to pollinate
  </p>
  <div class="relative w-full md:aspect-square h-full object-cover">
    <video bind:this={videoElement} class="">
      <track kind="captions" srclang="en" label="English captions" />
    </video>

    {#if parent1}
      <QrGenerate text={parent1.id} />
    {/if}
  </div>

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
          await addNewPlant(candidateChild, data.garden.id, data.seedBank.id);
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

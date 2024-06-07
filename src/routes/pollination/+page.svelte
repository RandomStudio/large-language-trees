<script lang="ts">
  import {
    type SelectPlant,
    type GardenViewData,
    type InsertPlant
  } from "../../lib/types"; // Assuming type import is correct

  import QrGenerate from "../../components/qr_generate.svelte";
  import { addNewPlant, confirmBreed } from "$lib/confirmBreed";
  import { onMount } from "svelte";
  import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
  import ConfirmBreedPopup from "../../components/ConfirmBreedPopup.svelte";
  import PopupDejaVu from "../../components/popupDejaVu.svelte";
  import { goto } from "$app/navigation";

  export let data: GardenViewData;
  let busy = false;

  let parent1: SelectPlant | null =
    data.seedBank.plantsInSeedbank.find(
      (plant) => plant.plant.parent1 == null && plant.plant.parent2 == null
    )?.plant || null;

  let parent2: SelectPlant | null = null;

  let candidateChild: InsertPlant | null = null;

  let child: SelectPlant | null = null;

  $: existingChild = (
    parents: [SelectPlant, SelectPlant]
  ): SelectPlant | null =>
    data.seedBank.plantsInSeedbank.find(
      (plant) =>
        parents.find((p) => p.id == plant.plant.parent1) &&
        parents.find((p) => p.id == plant.plant.parent2)
    )?.plant || null;
  let videoElement: HTMLVideoElement;

  onMount(async () => {
    const codeReader = new BrowserMultiFormatReader();

    const constraints = {
      video: {}
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    videoElement.srcObject = stream;
    videoElement.setAttribute("playsinline", "true"); // Required to tell iOS safari we don't want fullscreen
    videoElement.play();

    codeReader.decodeFromStream(stream, videoElement, (result, err) => {
      if (result && !busy) {
        // Handle the result here
        busy = true;
        const parent2Id = result.getText();
        fetch("/api/plants/" + parent2Id).then(async (res) => {
          if (res.status == 200) {
            parent2 = await res.json();
            if (parent1 && parent2) {
              child = existingChild([parent1, parent2]);
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

<div class="min-h-screen bg-roel_green overflow-hidden font-inter">
  <button
    class="fixed top-8 right-7 text-roel_blue flex items-center justify-center w-10 h-10 border-2 border-roel_blue rounded-full"
    on:click={() => goto("/gallery")}
  >
    <svg
      class="w-6 h-6 text-roel_blue"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  <main class="mx-14 mt-3">
    <p class="text-roel_blue text-2xl mb-6">
      Point your camera to another gardener's Pollination QR
    </p>

    <div class="relative w-full md:aspect-square overflow-hidden">
      <!-- La vidéo sera cropée pour être carrée -->
      <video bind:this={videoElement} class="object-cover w-full h-full">
        <!-- La vidéo remplit complètement le conteneur -->
        <track kind="captions" srclang="en" label="English captions" />
      </video>
      {#if parent1}
        <QrGenerate text={parent1.id} />
      {/if}
    </div>

    <p class="text-roel_blue text-2xl mb-6 text-center">Your Pollination QR</p>

    {#if candidateChild}
      <ConfirmBreedPopup
        {candidateChild}
        onCancel={() => {
          candidateChild = null;
        }}
        onConfirm={async (imageUrl, commonName) => {
          if (candidateChild) {
            console.log({ candidateChildId: candidateChild.id, imageUrl });
            candidateChild.imageUrl = imageUrl;
            candidateChild.commonName = commonName;
            await addNewPlant(candidateChild, data.garden.id, data.seedBank.id);
            candidateChild = null;
            busy = false;
          }
        }}
      />
    {/if}

    {#if child}
      <PopupDejaVu
        plantDetails={child}
        closePopup={() => {
          child = null;
        }}
      />
    {/if}
  </main>
</div>

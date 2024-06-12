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
  import ReturnButton from "../../components/ReturnButton.svelte";

  export let data: GardenViewData;
  import { getIndexValue } from "../gallery/shared.js";

  const indexValue = getIndexValue();
  console.log(indexValue);

  let parent1: SelectPlant | null =
    data.seedBank.plantsInSeedbank[indexValue].plant;

  let busy = false;

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

<ReturnButton functionReturn={() => goto("/gallery")}></ReturnButton>

<div class="mx-12 font-inter text-roel_blue text-left">
  <p class=" text-xl">Point your camera to another gardener's Pollination QR</p>
  <div class="mx-8">
    <video bind:this={videoElement} class="object-cover aspect-square mt-6">
      <track kind="captions" srclang="en" label="English captions" />
    </video>

    {#if parent1}
      <div class="mt-6">
        <QrGenerate text={parent1.id} />
      </div>
    {/if}
  </div>
  <p class="text-xl text-center mt-3">
    The ollination QR of {parent1.commonName}
  </p>
  {#if candidateChild}
    <ConfirmBreedPopup
      {candidateChild}
      onCancel={() => {
        candidateChild = null;
      }}
      onConfirm={async (updatedPlant) => {
        if (candidateChild) {
          candidateChild = updatedPlant;
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
</div>

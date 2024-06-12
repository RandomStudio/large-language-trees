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

  function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  onMount(async () => {
    const codeReader = new BrowserMultiFormatReader();

    let constraints = {
      video: {
        facingMode: isMobile() ? { exact: "environment" } : "user"
      }
    };

    try {
      let stream = await navigator.mediaDevices.getUserMedia(constraints);
      setupStream(stream);
    } catch (err) {
      if (isOverconstrainedError(err)) {
        // Fallback constraints if the exact constraints are not met
        constraints = {
          video: {
            facingMode: isMobile() ? "environment" : "user"
          }
        };
        try {
          let stream = await navigator.mediaDevices.getUserMedia(constraints);
          setupStream(stream);
        } catch (err) {
          handleError(err);
        }
      } else {
        handleError(err);
      }
    }
  });

  function setupStream(stream: MediaStream) {
    videoElement.srcObject = stream;
    videoElement.setAttribute("playsinline", "true"); // Required to tell iOS safari we don't want fullscreen
    videoElement.play();

    const codeReader = new BrowserMultiFormatReader();
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
  }

  function isOverconstrainedError(err: unknown): err is OverconstrainedError {
    return (err as OverconstrainedError).name === "OverconstrainedError";
  }

  function handleError(err: unknown) {
    if (err instanceof Error) {
      console.error("Error accessing camera: ", err.message);
    } else {
      console.error("Unknown error accessing camera: ", err);
    }
  }
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
  <p class="text-xl text-center mt-3">Your Pollination QR</p>
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

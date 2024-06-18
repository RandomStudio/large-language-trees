<script lang="ts">
  import {
    type SelectPlant,
    type EnhancedGardenViewData,
    type InsertPlant
  } from "../../../../lib/types"; // Assuming type import is correct

  import QrGenerate from "../../../../components/qr_generate.svelte";
  import { addConfirmedPlant, confirmBreed } from "$lib/confirmBreed";
  import { onMount } from "svelte";
  import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
  import ConfirmBreedPopup from "../../../../components/ConfirmBreedPopup.svelte";
  import PopupDejaVu from "../../../../components/popupDejaVu.svelte";
  import { goto } from "$app/navigation";
  import ReturnButton from "../../../../components/ReturnButton.svelte";
  import WaitingSpinner from "../../../../components/WaitingSpinner.svelte";

  export let data: EnhancedGardenViewData;

  let parent1 =
    data.seedBank.plantsInSeedbank.find((plant) => plant.plantId === data.id)
      ?.plant || undefined;

  let busy = false;

  let parent2: SelectPlant | null = null;

  let candidateChild: InsertPlant | null = null;

  let waiting: boolean = false;
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
  let stream: MediaStream;

  onMount(async () => {
    const codeReader = new BrowserMultiFormatReader();

    let constraints = {
      video: {
        facingMode: "environment"
      }
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      setupStream(stream);
    } catch (err) {
      if (isOverconstrainedError(err)) {
        // Fallback constraints if the exact constraints are not met
        constraints = {
          video: {
            facingMode: "user"
          }
        };
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
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

    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromStream(stream, videoElement, (result, err) => {
      if (result && !busy) {
        // Handle the result here
        busy = true;
        const parent2Id = result.getText();
        fetch("/api/plants/" + parent2Id)
          .then(async (res) => {
            if (res.status == 200) {
              parent2 = await res.json();
              if (parent1 && parent2) {
                child = existingChild([parent1, parent2]);
                if (child == null) {
                  waiting = true;
                  try {
                    candidateChild = await confirmBreed([parent1, parent2]);
                    if (candidateChild) {
                      console.log("Got candidate child OK:", candidateChild);
                      busy = false;
                    }
                    waiting = false;
                  } catch (e) {
                    console.error("Error getting candidate child", e);
                    handleError(e);
                  }
                } else {
                  handleError(new Error("failed to fetch plant details"));
                }
              }
            } else {
              handleError(
                new Error(`Failed to fetch plant with id ${parent2Id}`)
              );
            }
          })
          .catch((err) => {
            handleError(err);
          });
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
        busy = false;
      }
    });
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  function isOverconstrainedError(err: unknown): err is OverconstrainedError {
    return (err as OverconstrainedError).name === "OverconstrainedError";
  }

  function handleError(err: unknown) {
    if (err instanceof Error) {
      console.error("Error: ", err.message);
    } else {
      console.error("Unknown error: ", err);
    }
    goto("/gallery");
  }
</script>

<ReturnButton functionReturn={() => goto("/gallery")}></ReturnButton>

<div class="mx-12 font-inter text-roel_blue text-left">
  {#if parent1}
    <p class=" text-xl">
      Point your camera to another gardeners Pollination QR to start
      crossbreeding {parent1.commonName}
    </p>
    <div class="mx-8">
      <video
        bind:this={videoElement}
        class="object-cover aspect-square mt-12 overflow-hidden rounded-full"
      >
        <track kind="captions" srclang="en" label="English captions" />
      </video>

      <div class="mt-6">
        <QrGenerate text={parent1.id} />
      </div>
    </div>
  {/if}
</div>

{#if candidateChild}
  {stopStream()}
  <ConfirmBreedPopup
    {candidateChild}
    onCancel={() => {
      candidateChild = null;
      busy = false; // Allow scanning again if the process is cancelled
      // Restart the camera stream
      onMount(async () => {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        setupStream(stream);
      });
    }}
    onConfirm={async (updatedPlant) => {
      if (candidateChild) {
        candidateChild = updatedPlant;
        await addConfirmedPlant(
          candidateChild,
          data.garden.id,
          data.seedBank.id
        );
        candidateChild = null;
        busy = false;
      }
    }}
  />
{/if}

{#if waiting}
  <div
    class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-roel_green z-50 flex-col"
  >
    <WaitingSpinner></WaitingSpinner>
  </div>
{/if}

{#if child}
  <PopupDejaVu plantDetails={child} />
{/if}

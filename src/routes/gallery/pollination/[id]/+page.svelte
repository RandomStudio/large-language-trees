<script lang="ts">
  import {
    type SelectPlant,
    type EnhancedGardenViewData,
    type InsertPlant
  } from "../../../../lib/types"; // Assuming type import is correct

  import QrGenerate from "../../../../components/qr_generate.svelte";
  import {
    addConfirmedPlant,
    addConfirmedPlantToOtherUser,
    confirmBreed
  } from "$lib/confirmBreed";
  import { onMount, onDestroy } from "svelte";
  import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
  import ConfirmBreedPopup from "../../../../components/ConfirmBreedPopup.svelte";
  import PopupDejaVu from "../../../../components/popupDejaVu.svelte";
  import { goto } from "$app/navigation";
  import ReturnButton from "../../../../components/ReturnButton.svelte";
  import WaitingSpinner from "../../../../components/WaitingSpinner.svelte";
  import { page } from "$app/stores";

  export let data: EnhancedGardenViewData;

  let parent1 =
    data.seedBank.plantsInSeedbank.find(
      (plant) => plant.plantId === data.plantId
    )?.plant || undefined;

  let busy = false;

  let parent2: SelectPlant | null = null;

  let candidateChild: InsertPlant | null = null;
  let otherUserSeedbankId: string;

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
        const readText = result.getText();
        const parent2Id = readText.split("&")[0];
        otherUserSeedbankId = readText.split("&")[1];
        fetch("/api/plants/" + parent2Id)
          .then(async (res) => {
            if (res.status == 200) {
              parent2 = await res.json();
              if (parent1 && parent2 && parent1.id != parent2.id) {
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
                }
              } else {
                child = parent1 || null;
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
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
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
    stopStream();
    goto("/gallery");
  }

  function handleReturn() {
    stopStream();
    goto("/gallery");
  }

  onDestroy(() => {
    stopStream();
  });
</script>

<ReturnButton functionReturn={handleReturn}></ReturnButton>

<div class="mx-12 font-inter text-roel_blue text-left">
  {#if parent1}
    <p class=" text-xl">
      Point your camera to another gardeners Pollination QR to start
      crossbreeding {parent1.commonName}
    </p>
    <div class="mx-8">
      <div class="relative mt-12">
        <video
          bind:this={videoElement}
          class="object-cover aspect-square overflow-hidden rounded-full z-0"
        >
          <track kind="captions" srclang="en" label="English captions" />
        </video>
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img
          src={parent1.imageUrl}
          alt="Small Image"
          class="absolute bottom-0 right-0 -mb-1 w-20 h-20 z-10"
        />
      </div>
      <div class="mt-6">
        <QrGenerate text={parent1.id + "&" + data.seedBank.id} />
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
        await addConfirmedPlantToOtherUser(candidateChild, otherUserSeedbankId);
        candidateChild = null;
        busy = false;
      }
    }}
  />
{/if}

{#if waiting}
  {stopStream()}
  <div
    class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-roel_green z-50 flex-col"
  >
    <WaitingSpinner></WaitingSpinner>
  </div>
{/if}

{#if child}
  {stopStream()}
  <PopupDejaVu plantDetails={child} />
{/if}

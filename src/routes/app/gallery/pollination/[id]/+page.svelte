<script lang="ts">
  import QrGenerate from "../../../../../components/qr_generate.svelte";
  import { onMount, onDestroy } from "svelte";
  import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
  import ConfirmBreedPopup from "./ConfirmBreedPopup.svelte";
  import PopupDejaVu from "../../../../../components/popupDejaVu.svelte";
  import { goto } from "$app/navigation";
  import ReturnButton from "../../../../../components/ReturnButton.svelte";
  import WaitingSpinner from "../../../../../components/WaitingSpinner.svelte";

  import {
    addConfirmedPlant,
    addConfirmedPlantToOtherUser,
    confirmBreed
  } from "./confirmBreed";
  import type {
    EnhancedGardenViewData,
    InsertPlant,
    SelectPlant,
    SelectSeedbank
  } from "$lib/types";
  import type { EventNewPollination } from "$lib/events.types";

  export let data: EnhancedGardenViewData;

  let videoElement: HTMLVideoElement;
  let codeReader: BrowserMultiFormatReader | null = null;

  let parent1 =
    data.seedbank.plantsInSeedbank.find(
      (plant) => plant.plantId === data.plantId
    )?.plant || undefined;

  let busy = false;

  let parent2: SelectPlant | null = null;

  let candidateChild: InsertPlant | null = null;
  let otherUserSeedbankId: string | null = null;

  let waiting: boolean = false;
  let child: SelectPlant | null = null;

  $: existingChild = (
    parents: [SelectPlant, SelectPlant]
  ): SelectPlant | null =>
    data.seedbank.plantsInSeedbank.find(
      (plant) =>
        parents.find((p) => p.id == plant.plant.parent1) &&
        parents.find((p) => p.id == plant.plant.parent2)
    )?.plant || null;

  onMount(async () => {
    try {
      await startQrScanning();
    } catch (e) {
      console.error("onMount: Error starting camera / QR scanning");
      // Should this redirect or display error notification?
      // goto("/app/gallery");
    }
  });

  async function getStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        }
      });
      return stream;
    } catch (err) {
      if (isOverconstrainedError(err)) {
        console.warn(
          "Stream attempt #1 failed, but it was OverConstrainedError; try again...",
          err
        );
        // Fallback constraints if the exact constraints are not met
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user"
            }
          });
          return stream;
        } catch (err) {
          throw Error("Stream attempt #2 failed: " + err);
        }
      } else {
        throw Error("Stream attempt #1 failed: " + err);
      }
    }
  }

  async function startQrScanning() {
    console.log("Attempt to start camera + QR scanning...");
    const stream = await getStream(); // throws Error if unsuccessful
    console.log("... stream started OK");
    videoElement.srcObject = stream;
    videoElement.setAttribute("playsinline", "true"); // Required to tell iOS safari we don't want fullscreen

    if (codeReader) {
      console.warn("codeReader was already running; stop it first");
      codeReader.stopContinuousDecode();
    }

    codeReader = new BrowserMultiFormatReader();

    codeReader.decodeFromStream(stream, videoElement, (result, err) => {
      if (result && !busy) {
        // Handle the result here
        busy = true;
        const readText = result.getText();
        const [part1, part2] = readText.split("&");
        console.log("scan text:", { part1, part2 });
        const parent2Id = part1;
        otherUserSeedbankId = part2;
        onCodeScanned(parent2Id)
          .then(() => {
            console.log("(onCodeScanned) ...done");
          })
          .catch((e) => {
            console.error("Error updating after QR code found: ", e);
          });
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
        busy = false;
      }
    });
  }

  async function onCodeScanned(parent2Id: string) {
    stopScanning();
    const res = await fetch("/api/plants/" + parent2Id);

    if (res.status == 200) {
      parent2 = await res.json();
      if (parent1 && parent2 && parent1.id != parent2.id) {
        child = existingChild([parent1, parent2]);
        if (child === null) {
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
            // Should this redirect or display error notification?
          }
        }
      } else {
        child = parent1 || null;
      }
    } else {
      throw Error(`Failed to fetch plant with id ${parent2Id}`);
      // Should this redirect or display error notification?
    }
  }

  function stopScanning() {
    console.log("Stop camera + scanning");
    if (!videoElement) {
      return;
    }

    if (codeReader) {
      codeReader.stopContinuousDecode();
    }

    const stream = videoElement.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    videoElement.srcObject = null;
  }

  function isOverconstrainedError(err: unknown): err is OverconstrainedError {
    return (err as OverconstrainedError).name === "OverconstrainedError";
  }

  function onReturnButtonClicked() {
    stopScanning();
    console.log("onReturnButtonClicked; wait 1s then redirect...");
    setTimeout(() => {
      goto("/app/gallery");
    }, 1000);
  }

  onDestroy(() => {
    stopScanning();
  });

  async function insertNewPlant(updatedPlant: InsertPlant) {
    if (candidateChild && otherUserSeedbankId) {
      candidateChild = updatedPlant;
      candidateChild.authorTop = data.user.id;
      const seedbankRes = await fetch(`/api/seedbanks/${otherUserSeedbankId}`);
      const otherSeedbank = (await seedbankRes.json()) as SelectSeedbank;
      candidateChild.authorBottom = otherSeedbank.userId;
      await addConfirmedPlant(candidateChild, data.garden.id, data.seedbank.id);
      await addConfirmedPlantToOtherUser(candidateChild, otherUserSeedbankId);

      const event: EventNewPollination = {
        name: "newPlantPollination",
        payload: candidateChild
      };
      const eventRes = await fetch("/api/events", {
        method: "POST",
        body: JSON.stringify(event)
      });
      console.log("event response:", eventRes.status, eventRes.statusText);

      candidateChild = null;
      busy = false;
    } else {
      console.error("Missing data", { candidateChild, otherUserSeedbankId });
    }
  }
</script>

<ReturnButton onClicked={onReturnButtonClicked}></ReturnButton>

<div class="bg-roel_blue rounded-b-full">
  <div class="pt-[17px] mx-10 font-primer text-2xl text-roel_green text-left">
    {#if parent1}
      <p class=" text-2xl mr-6">
        Scan another gardeners QR to crossbreed the {parent1.commonName}
      </p>
      <div class="mx-0">
        <div class="relative mt-4 pb-10">
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
            class="absolute -bottom-3 -right-8 -mb-1 w-40 h-40 z-10"
          />
        </div>
        <div class="mt-2 mx-16 absolute place-self-center">
          <QrGenerate text={parent1.id + "&" + data.seedbank.id} />
        </div>
      </div>
    {/if}
  </div>
</div>

{#if candidateChild}
  <ConfirmBreedPopup
    {candidateChild}
    onCancel={async () => {
      candidateChild = null;
      busy = false; // Allow scanning again if the process is cancelled
      await startQrScanning();
    }}
    onConfirm={insertNewPlant}
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

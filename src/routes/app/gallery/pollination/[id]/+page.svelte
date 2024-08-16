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
  let otherUserId: string | null = null;

  let waiting: boolean = false;
  let child: SelectPlant | null = null;

  let isLoadingCamera = true;
  let errorMessage: string | null = null;

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
      if (data.otherPlantId && data.otherUserId) {
        console.log(
          "otherPlantId and otherUserId provided by URL search params; skip scanning..."
        );
        otherUserId = data.otherUserId;
        onCodeScanned(data.otherPlantId).then(() => {
          "onCodeScanned success; skipped actual scanning and used searchparams";
        });
      } else {
        console.log(
          "no/incorrect searchparams provided, so we're going to use QR scanning...",
          { otherPlantId: data.otherPlantId, otherUserId: data.otherUserId }
        );
        await startQrScanning();
      }
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
          errorMessage = "Please check the camera authorisations";
          throw Error("Stream attempt #2 failed: " + err);
        }
      } else {
        errorMessage = "Please check the camera authorisations";
        throw Error("Stream attempt #1 failed: " + err);
      }
    }
  }

  async function startQrScanning() {
    errorMessage = null;
    console.log("Attempt to start camera + QR scanning...");
    const stream = await getStream(); // throws Error if unsuccessful
    console.log("... stream started OK");
    isLoadingCamera = false;
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
        otherUserId = part2;
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
            candidateChild = await confirmBreed(data.user.id, [
              parent1,
              parent2
            ]);
            if (candidateChild) {
              console.log("Got candidate child OK:", candidateChild);
              busy = false;
            }
            waiting = false;
            console.log({ candidateChild });
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
    if (candidateChild && otherUserId) {
      candidateChild = updatedPlant;
      candidateChild.authorTop = data.user.id;
      candidateChild.authorBottom = otherUserId;
      console.log(
        "insertNewPlant setting authorTop = ",
        data.user.id,
        ", authorBottom = ",
        otherUserId
      );
      await addConfirmedPlant(candidateChild, data.garden.id, data.seedbank.id);
      await addConfirmedPlantToOtherUser(candidateChild, otherUserId);

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
      console.error("Missing data", { candidateChild, otherUserId });
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
      {#if errorMessage}
        <p class="text-xl text-red-500">{errorMessage}</p>
      {/if}
      <div class="mx-0">
        <div class="relative mt-4 pb-10">
          <div
            class="object-cover aspect-square overflow-hidden rounded-full z-10 bg-black"
          >
            <div style="display:{isLoadingCamera ? 'none' : 'block'}">
              <video
                bind:this={videoElement}
                class="object-cover aspect-square"
              >
                <track kind="captions" srclang="en" label="English captions" />
              </video>
            </div>
          </div>
          <!-- svelte-ignore a11y-img-redundant-alt -->
          <img
            src={parent1.imageUrl}
            alt="Small Image"
            class="absolute -bottom-3 -right-8 -mb-1 w-40 h-40 z-20"
            crossorigin="anonymous"
          />
        </div>
        <div class="mt-2 mx-16 absolute place-self-center">
          <QrGenerate text={parent1.id + "&" + data.user.id} />
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- <div class="fixed top-0 left-0" style:z-index={100}>
  <pre>
    <code>{JSON.stringify({ candidateChild, waiting }, null, 2)}</code>
  </pre>
</div> -->

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

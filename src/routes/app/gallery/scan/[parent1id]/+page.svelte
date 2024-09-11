<script lang="ts">
  import { goto } from "$app/navigation";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";
  import type { PublicUserInfo, ScanStartData, SelectPlant } from "$lib/types";
  import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
  import { onDestroy, onMount } from "svelte";
  import PollinationQrCode from "../../pollinate/[parent1id]/PollinationQrCode.svelte";

  export let data: ScanStartData;

  let videoElement: HTMLVideoElement;
  let codeReader: BrowserMultiFormatReader | null = null;
  let errorMessage: string | null = null;
  let isLoadingCamera: boolean = true;

  const getStream = async () => {
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
  };

  const startQrScanning = async () => {
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
      if (result) {
        // Handle the result here
        const readText = result.getText();
        const [part1, part2] = readText.split("&");
        console.log("scan text:", { part1, part2 });
        const otherPlantId = part1;
        const otherUserId = part2;

        onCodeScanned(otherPlantId, otherUserId);
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
        errorMessage = "Error: " + err;
      }
    });
  };

  const stopScanning = () => {
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
  };

  const onCodeScanned = (otherPlantId: string, otherUserId: string) => {
    stopScanning();

    // goto(`/app/gallery/pollinate/${data.thisPlant.id}`);
  };

  const isOverconstrainedError = (err: unknown): err is OverconstrainedError =>
    (err as OverconstrainedError).name === "OverconstrainedError";

  onMount(async () => {
    await startQrScanning();
  });

  onDestroy(() => {
    stopScanning();
  });
</script>

<ReturnButton
  onClicked={() => {
    stopScanning();
    console.log("onReturnButtonClicked; wait 1s then redirect...");
    setTimeout(() => {
      goto("/app/gallery");
    }, 1000);
  }}
></ReturnButton>

<div class="bg-roel_blue rounded-b-full">
  <div class="pt-[17px] mx-10 font-primer text-2xl text-roel_green text-left">
    <p class=" text-2xl mr-6">
      Scan another gardeners QR to crossbreed the {data.thisPlant.commonName}
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
            <video bind:this={videoElement} class="object-cover aspect-square">
              <track kind="captions" srclang="en" label="English captions" />
            </video>
          </div>
        </div>
        <PlantDisplay
          imageUrl={data.thisPlant.imageUrl || ""}
          applyFilters={false}
          positionStyles={"absolute -bottom-3 -right-8 -mb-1 w-40 h-40 z-10"}
        />
      </div>
      <div class="mt-2 mx-16 absolute place-self-center">
        <PollinationQrCode
          plantId={data.thisPlant.id}
          userId={data.thisUser.id}
        />
      </div>
    </div>
  </div>
</div>

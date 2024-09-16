<script lang="ts">
  import { goto } from "$app/navigation";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";
  import type {
    GeneratePlantRequestBody,
    PublicUserInfo,
    ScanStartData,
    SelectPlant
  } from "$lib/types";
  import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
  import { onDestroy, onMount } from "svelte";
  import PollinationQrCode from "../../pollinate/PollinationQrCode.svelte";
  import NameChildPlant from "./NameChildPlant.svelte";
  import PopupDejaVu from "../../pollinate/PopupDejaVu.svelte";
  import Layout from "../../../components/Layout.svelte";

  export let data: ScanStartData;
  let otherUser: PublicUserInfo | null = null;
  let otherPlant: SelectPlant | null = null;

  let videoElement: HTMLVideoElement;
  let codeReader: BrowserMultiFormatReader | null = null;
  let errorMessage: string = "";
  let isLoadingCamera: boolean = true;

  let alreadyExistsPlant: SelectPlant | null = null;

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
    errorMessage = "";
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
    otherUser = null;
    otherPlant = null;
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

  const onCodeScanned = async (otherPlantId: string, otherUserId: string) => {
    stopScanning();
    alreadyExistsPlant = findAlreadyExists(
      data.thisPlant.id,
      otherPlantId,
      data.userPlants
    );
    if (!alreadyExistsPlant) {
      console.info("New child plant possible!");
      otherPlant = await getOtherPlantDetails(otherPlantId);
      otherUser = await getOtherUserDetails(otherUserId);
    } else {
      console.warn(
        "This child combination already exists!",
        alreadyExistsPlant
      );
    }
  };

  const isOverconstrainedError = (err: unknown): err is OverconstrainedError =>
    (err as OverconstrainedError).name === "OverconstrainedError";

  const findAlreadyExists = (
    thisPlantId: string,
    otherPlantId: string,
    thisUserPlants: SelectPlant[]
  ): SelectPlant | null => {
    const match = thisUserPlants.find(
      (p) =>
        (p.parent1 === thisPlantId && p.parent2 === otherPlantId) ||
        (p.parent1 === otherPlantId && p.parent2 === thisPlantId)
    );

    return match || null;
  };

  const getOtherUserDetails = async (userId: string) =>
    (await (await fetch(`/api/users/${userId}`)).json()) as PublicUserInfo;

  const getOtherPlantDetails = async (plantId: string) =>
    (await (await fetch(`/api/plants/${plantId}`)).json()) as SelectPlant;
  onMount(async () => {
    await startQrScanning();
  });

  const initiateBackgroundRequest = async (
    otherUserId: string,
    otherPlantId: string,
    userPickedNewName: string
  ) => {
    const jsonBody: GeneratePlantRequestBody = {
      thisUserId: data.thisUser.id,
      thisPlantId: data.thisPlant.id,
      otherUserId: otherUserId,
      otherPlantId: otherPlantId,
      userPickedNewName
    };
    const res = await fetch(`/api/plants/generate`, {
      method: "POST",
      body: JSON.stringify(jsonBody)
    });
  };

  onDestroy(() => {
    stopScanning();
  });
</script>

<Layout title="Let's Pollinate">
  <div class="mb-[80px]">
    <p class="pb-4 text-roel_green">
      Point your camera to another gardeners Pollination QR to start
      crossbreeding {data.thisPlant.commonName}.
    </p>
    <p class="text-xl text-red-500 pb-6">{"" ?? errorMessage}</p>
    <div class="relative shrink flex flex-col">
      <div
        class="object-cover aspect-square w-60 place-self-center overflow-hidden rounded-full bg-black"
      >
        <div style="display:{isLoadingCamera ? 'none' : 'block'}">
          <video
            bind:this={videoElement}
            class="object-cover aspect-square pointer-events-none"
          >
            <track kind="captions" srclang="en" label="English captions" />
          </video>
        </div>
        <PlantDisplay
          imageUrl={data.thisPlant.imageUrl || ""}
          applyFilters={false}
          positionStyles={"absolute -bottom-3 -right-8 -mb-1 w-40 h-40 pointer-events-none"}
        />
      </div>
    </div>

    <div class="mt-2 mx-16 place-self-center shrink-0">
      <PollinationQrCode
        plantId={data.thisPlant.id}
        userId={data.thisUser.id}
      />
    </div>
  </div>

  {#if otherPlant && otherUser}
    <NameChildPlant
      {otherUser}
      thisUser={data.thisUser}
      onNameChosen={(nameChosen) => {
        if (otherPlant && otherUser) {
          initiateBackgroundRequest(otherUser.id, otherPlant.id, nameChosen)
            .then(() => {
              goto(`/app/gallery`);
            })
            .catch((e) => {
              errorMessage = "Error: " + e;
            });
        }
      }}
      onCancel={() => {
        otherPlant = null;
        otherUser = null;
        startQrScanning();
      }}
    />
  {/if}

  {#if alreadyExistsPlant}
    <PopupDejaVu
      plantDetails={alreadyExistsPlant}
      handleClose={() => {
        alreadyExistsPlant = null;
        otherPlant = null;
        startQrScanning();
      }}
    />
  {/if}
</Layout>

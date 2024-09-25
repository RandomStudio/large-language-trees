<script lang="ts">
  import { goto } from "$app/navigation";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";

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
  import { TetherAgent, InputPlug, decode } from "tether-agent";
  import { PLUG_NAMES } from "$lib/constants";
  import {
    SimpleEventNames,
    type EventPollinationStarting
  } from "$lib/events.types";
  import { BROWSER_CONNECTION } from "../../../../../defaults/tether";
  import { error } from "@sveltejs/kit";
  import PollinationWasStartedPopup from "./PollinationWasStartedPopup.svelte";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";

  export let data: ScanStartData;
  let otherUser: PublicUserInfo | null = null;
  let otherPlant: SelectPlant | null = null;

  let videoElement: HTMLVideoElement;
  let codeReader: BrowserMultiFormatReader | null = null;
  let errorMessage: string = "";
  let isLoadingCamera: boolean = true;

  let agent: TetherAgent | null = null;

  let alreadyExistsPlant: SelectPlant | null = null;

  let otherUserStartedPollination: PublicUserInfo | null = null;

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
        if (part1 && part2) {
          const otherPlantId = part1;
          const otherUserId = part2;

          onCodeScanned(otherPlantId, otherUserId);
        } else {
          console.error("Weird results... stop and restart scanning");
          stopScanning();
          startQrScanning();
        }
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

  const onCodeScanned = async (otherPlantId: string, otherUserId: string) => {
    if (otherUserId === data.thisUser.id) {
      console.error("this user is myself; try again");
    }
    otherUser = await getOtherUserDetails(otherUserId);

    if (!otherUser) {
      throw Error("this user does not exist in the DB");
    } else {
      console.log("other user fetched OK:", otherUser);
    }

    stopScanning();

    alreadyExistsPlant = findAlreadyExists(
      data.thisPlant.id,
      otherPlantId,
      data.userPlants
    );
    if (!alreadyExistsPlant) {
      console.info("New child plant possible!");
      otherPlant = await getOtherPlantDetails(otherPlantId);

      if (!otherPlant) {
        throw Error("failed to fetch other plant details");
      }

      const authorBottom = { ...otherUser };

      const e: EventPollinationStarting = {
        name: SimpleEventNames.POLLINATION_STARTING,
        payload: {
          authorTop: data.thisUser,
          authorBottom,
          plantTop: data.thisPlant,
          plantBottom: otherPlant
        }
      };
      console.log("sending", e);
      await fetch("/api/events", {
        method: "POST",
        body: JSON.stringify(e)
      });
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

  const getOtherUserDetails = async (
    userId: string
  ): Promise<PublicUserInfo | null> => {
    const res = await fetch(`/api/users/${userId}`);
    if (res.status !== 200) {
      console.error("user not found", res.status, res.statusText);
      return null;
    } else {
      const user = (await res.json()) as PublicUserInfo;
      return user;
    }
  };

  const getOtherPlantDetails = async (
    plantId: string
  ): Promise<SelectPlant | null> => {
    const res = await fetch(`/api/plants/${plantId}`);
    if (res.status !== 200) {
      console.error(
        "Failed to fetch plaint details:",
        res.status,
        res.statusText
      );
      return null;
    } else {
      const plant = (await res.json()) as SelectPlant;
      return plant;
    }
  };

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
    try {
      const res = await fetch(`/api/plants/generate`, {
        method: "POST",
        body: JSON.stringify(jsonBody)
      });
    } catch (e) {
      console.error("Error POSTing to /api/plants/generate", e);
    }
  };

  onMount(async () => {
    try {
      await startQrScanning();
    } catch (e) {
      console.error("error started qr code scanning");
    }

    agent = await TetherAgent.create("app", {
      brokerOptions: BROWSER_CONNECTION
    });

    // Once the other user has successfully scanned our code,
    // we are notified
    const newPollinationStartedOtherUser = await InputPlug.create(
      agent,
      PLUG_NAMES.simpleEvents,
      {
        id: "newPollinationStarting"
      }
    );
    newPollinationStartedOtherUser.on("message", (payload) => {
      const m = decode(payload) as EventPollinationStarting;
      // console.log(m.payload.authorBottom.id, data.thisUser.id);
      if (m.payload.authorBottom.id === data.thisUser.id) {
        console.log(
          "New pollination started for plant of which I am the 'other' author",
          m.payload
        );
        otherUserStartedPollination = m.payload.authorTop;
      }
    });
  });

  onDestroy(() => {
    stopScanning();
  });
</script>

{#if otherPlant && otherUser}
  <NameChildPlant
    {otherUser}
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
  />
{:else if otherUserStartedPollination}
  <PollinationWasStartedPopup otherUser={otherUserStartedPollination} />
{:else}
  <Layout title="Let's Pollinate">
    <div class="">
      <ReturnButton
        onClick={async () => {
          stopScanning();
          await goto("/app/gallery");
        }}
      />
      <p class="pb-4 text-roel_green">
        Point your camera to another gardeners Pollination QR to start
        crossbreeding your {data.thisPlant.commonName}.
      </p>
      <div class="relative">
        <div class="overflow-hidden rounded-full bg-transparent mb-8">
          <video
            bind:this={videoElement}
            class="object-cover aspect-square w-full pointer-events-none"
            class:opacity-30={errorMessage}
          >
            <track kind="captions" srclang="en" label="English captions" />
          </video>
        </div>
        <div class="absolute bottom-0 right-0 translate-x-6 translate-y-6">
          <img
            class="w-40"
            src={data.thisPlant.imageUrl}
            alt={data.thisPlant.commonName}
            crossorigin="anonymous"
          />
          <!-- <PlantDisplay
            imageUrl={data.thisPlant.imageUrl || ""}
            applyFilters={false}
          /> -->
        </div>
        <p
          class="text-medium text-red-500 absolute top-1/2 left-1/2 -translate-y-2/4 -translate-x-2/4 text-center"
        >
          {errorMessage}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-center">
      <PollinationQrCode
        plantId={data.thisPlant.id}
        userId={data.thisUser.id}
      />
    </div>

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
{/if}

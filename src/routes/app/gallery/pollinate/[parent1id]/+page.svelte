<script lang="ts">
  import PollinationQrCode from "./PollinationQrCode.svelte";
  import { onMount, onDestroy } from "svelte";
  import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
  import ConfirmBreedPopup from "./ConfirmBreedPopup.svelte";
  import PopupDejaVu from "./PopupDejaVu.svelte";
  import { goto } from "$app/navigation";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";
  import PlantMorphSpinner from "$lib/shared-components/PlantMorphSpinner.svelte";

  import {
    addConfirmedPlant,
    addConfirmedPlantToOtherUser,
    startTextGeneration
  } from "./PollinationFrontendFunctions";
  import type {
    InsertPlant,
    PollinationData,
    PublicUserInfo,
    SelectPlant,
    SelectSeedbank
  } from "$lib/types";
  import type { EventNewPollination } from "$lib/events.types";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import NameChildPlant from "./NameChildPlant.svelte";

  export let data: PollinationData;

  // let parent1 =
  //   data.seedbank.plantsInSeedbank.find(
  //     (plant) => plant.plantId === data.plantId
  //   )?.plant || undefined;

  // let busy = false;

  // let parent2: SelectPlant | null = null;

  // let candidateChild: InsertPlant | null = null;
  // let otherUserId: string | null = null;
  // let otherUserName: string | null = null;

  // let waiting: boolean = false;
  // let alreadyExistingBreed: SelectPlant | null = null;

  // let isLoadingCamera = true;
  // let errorMessage: string | null = null;

  // let proposedNewName: string | null = null;

  // const findExistingChild = (
  //   parents: [SelectPlant, SelectPlant]
  // ): SelectPlant | null =>
  //   data.seedbank.plantsInSeedbank.find(
  //     (plant) =>
  //       parents.find((p) => p.id == plant.plant.parent1) &&
  //       parents.find((p) => p.id == plant.plant.parent2)
  //   )?.plant || null;

  onMount(async () => {
    try {
      if (data.otherPlant && data.otherUser) {
        console.log(
          "otherPlant and otherUser loaded by URL search params; skip scanning..."
        );
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
      throw Error("onMount: Error starting camera / QR scanning");
      // Should this redirect or display error notification?
      // goto("/app/gallery");
    }
  });

  async function onCodeScanned(parent2Id: string) {
    stopScanning();
    const res = await fetch("/api/plants/" + parent2Id);

    if (res.status == 200) {
      data.otherPlant = (await res.json()) as SelectPlant;
      if (parent1 && parent2 && parent1.id != parent2.id) {
        alreadyExistingBreed = findExistingChild([parent1, parent2]);
        if (alreadyExistingBreed === null) {
          proposedNewName = "Unnamed" + Math.round(Math.random() * 100);

          // waiting = true;
          // try {
          //   candidateChild = await startTextGeneration(data.user.id, [
          //     parent1,
          //     parent2
          //   ]);
          //   if (candidateChild) {
          //     console.log("Got candidate child OK:", candidateChild);
          //     busy = false;
          //   }
          //   waiting = false;
          //   console.log({ candidateChild });
          // } catch (e) {
          //   console.error("Error getting candidate child", e);
          //   // Should this redirect or display error notification?
          // }
        }
      }
    } else {
      throw Error(`Failed to fetch plant with id ${parent2Id}`);
      // Should this redirect or display error notification?
    }
  }
</script>

{#if proposedNewName !== null && otherUserName}
  <NameChildPlant
    {otherUserName}
    initNewName={proposedNewName}
    onNameChosen={(name) => {
      proposedNewName = name;
    }}
  />
{/if}

<!-- {#if candidateChild}
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
    <PlantMorphSpinner></PlantMorphSpinner>
  </div>
{/if} -->

{#if alreadyExistingBreed}
  <PopupDejaVu
    plantDetails={alreadyExistingBreed}
    handleClose={async () => {
      alreadyExistingBreed = null;
      busy = false; // Allow scanning again if the process is cancelled
      await startQrScanning();
    }}
  />
{/if}

<script lang="ts">
  import type { InsertPlant } from "$lib/types";
  import { TOLERANCE_SIMPLE } from "$lib/constants";
  import TransparencyMaker from "$lib/shared-components/TransparencyMaker.svelte";
  import ButtonBottom from "$lib/shared-components/ButtonBottom.svelte";
  import PlantMorphSpinner from "$lib/shared-components/PlantMorphSpinner.svelte";
  import PopupError from "./PopupError.svelte";

  import { fade } from "svelte/transition";
  import { insertNewPlant } from "./PollinationFrontendFunctions";
  import { onMount } from "svelte";

  export let candidateChild: InsertPlant;

  let userErrorMessage: string | null = null;

  /** A local copy of the incoming "candidateChild", which we update as necessary before
   * returning to the parent component ready to add to the database.
   */
  let finalChildReadyToAdd: InsertPlant = { ...candidateChild };

  export let onCancel: () => any;
  export let onConfirm: () => any;

  let waitingForImage = false;
  let candidateImageUrl: string | null = candidateChild.imageUrl || null;
  let errorText: string = "";

  const finalise = async () => {
    await insertNewPlant(finalChildReadyToAdd);
    onConfirm();
  };

  const replaceImage = (url: string) => {
    console.log(
      "ConfirmBreedPopup replacing url",
      candidateImageUrl,
      "=>",
      url
    );
    candidateImageUrl = url;
    finalChildReadyToAdd.imageUrl = url;
  };

  onMount(() => {
    console.log("I'm here!", candidateChild);
  });
</script>

{#if waitingForImage}
  <div
    class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-roel_green z-50"
  >
    <div class="flex flex-col items-center">
      <PlantMorphSpinner></PlantMorphSpinner>
      <div
        id="message"
        class="text-roel_blue font-primer text-2xl mt-4 text-center"
      >
        Please wait...
      </div>
    </div>
  </div>
{/if}

{#if candidateImageUrl}
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green z-40">
    <div class="overflow-y-auto pb-20" style="max-height: calc(100%);">
      <div class="mx-12 font-primer text-roel_blue text-left mt-5">
        <p class="text-2xl">Hooray you made a new plant.</p>

        <TransparencyMaker
          src={candidateImageUrl}
          useFloodFill={false}
          tolerance={TOLERANCE_SIMPLE}
          doUpload={true}
          onUploadComplete={(url) => {
            replaceImage(url);
            waitingForImage = false;
          }}
        />

        <p class="mt-8 text-base">{errorText}</p>
        <p class="mt-8 text-base mb-0">{candidateChild.description}</p>

        <br />
        <br />
      </div>
    </div>
  </div>

  <div transition:fade={{ delay: 2000, duration: 1 }}>
    <ButtonBottom text="Ok" onClick={finalise} width="w-7/12"></ButtonBottom>
  </div>

  <button
    data-umami-event="Cancel Pollination Button"
    on:click={onCancel}
    class=" border-roel_green border-2 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent w-full hidden"
    >Cancel</button
  >
{/if}

{#if userErrorMessage}
  <PopupError errorText={userErrorMessage} onClick={onCancel}></PopupError>
{/if}

<script lang="ts">
  import { goto } from "$app/navigation";
  import type {
    GeneratedImage,
    InsertPlant,
    AttachImageResponse
  } from "$lib/types";
  import { TOLERANCE_SIMPLE } from "$lib/constants";
  import TransparencyMaker from "$lib/shared-components/TransparencyMaker.svelte";
  import ButtonBottom from "$lib/shared-components/ButtonBottom.svelte";
  import PlantMorphSpinner from "$lib/shared-components/PlantMorphSpinner.svelte";
  import PopupError from "./PopupError.svelte";
  import { LIMIT_CHARACTERS_PLANTNAME } from "$lib/constants";

  import { fade } from "svelte/transition";

  export let candidateChild: InsertPlant;

  let userErrorMessage: string | null = null;

  /** A local copy of the incoming "candidateChild", which we update as necessary before
   * returning to the parent component ready to add to the database.
   */
  let finalChildReadyToAdd: InsertPlant = { ...candidateChild };

  export let onCancel: () => any;
  export let onConfirm: (plantReadyToAdd: InsertPlant) => Promise<void>;

  let textInput = finalChildReadyToAdd.commonName || "";
  let waitingForImage = false;
  let candidateImageUrl: string | null = null;
  let errorText: string = "";

  async function handleAction() {
    if (textInput.trim() === "") {
      errorText = "Error : Please write something";
    } else {
      try {
        const previousCommonName = finalChildReadyToAdd.commonName;
        finalChildReadyToAdd.commonName = textInput;

        await onConfirm(finalChildReadyToAdd);
        goto("../");
      } catch (error) {
        console.error("Error during confirmation:", error);
      }
    }
  }

  function handleSubmit() {
    if (textInput.trim() === "") {
      console.log("Please write something");
      return;
    }

    console.log("Name given:", textInput);

    if (finalChildReadyToAdd.description && finalChildReadyToAdd.commonName) {
    }
    finalChildReadyToAdd.commonName = textInput;

    //@ts-ignore
    umami.track("Named Plant");
  }

  function replaceImage(url: string) {
    console.log(
      "ConfirmBreedPopup replacing url",
      candidateImageUrl,
      "=>",
      url
    );
    candidateImageUrl = url;
    finalChildReadyToAdd.imageUrl = url;
  }

  const messages = [
    "Plants are being dug up",
    "The roots are intertwining",
    "DNA is being mixed up",
    "A new seed is created",
    "Watering the new plant",
    "Flowers are budding"
  ];
  let currentIndex = 0;

  setInterval(() => {
    if (currentIndex < messages.length - 1) {
      currentIndex = (currentIndex + 1) % messages.length;
    }
  }, 3000);

  // generateImage();
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
        {messages[currentIndex]} ...
      </div>
    </div>
  </div>
{/if}

{#if candidateImageUrl}
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green z-40">
    <div class="overflow-y-auto pb-20" style="max-height: calc(100%);">
      <div class="mx-12 font-primer text-roel_blue text-left mt-5">
        <p class="text-2xl">
          Hooray you made a new plant. What would you like it to be named?
        </p>

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
        <div class="text-center">
          <form on:submit|preventDefault={handleSubmit} class="mt-2">
            <input
              type="text"
              bind:value={textInput}
              class="bg-roel_blue bg-opacity-10 border-[3px] px-4 py-2 border-roel_blue rounded-full font-primer text-roel_blue text-2xl w-11/12 max-w-xs placeholder-dark_grey placeholder:font-inter text-center"
              placeholder="Name your flower"
              maxlength={LIMIT_CHARACTERS_PLANTNAME}
            />
          </form>
        </div>
        <p class="mt-8 text-base">{errorText}</p>
        <p class="mt-8 text-base mb-0">{candidateChild.description}</p>

        <br />
        <br />
      </div>
    </div>
  </div>

  <div transition:fade={{ delay: 2000, duration: 1 }}>
    <ButtonBottom text="Ok" onClick={handleAction} width="w-7/12"
    ></ButtonBottom>
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

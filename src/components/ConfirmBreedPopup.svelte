<script lang="ts">
  import { goto } from "$app/navigation";
  import type { GeneratedImageResult, InsertPlant } from "$lib/types";
  import { TOLERANCE_SIMPLE } from "../defaults/constants";
  import TransparencyMaker from "./TransparencyMaker.svelte";

  export let candidateChild: InsertPlant;

  /** A local copy of the incoming "candidateChild", which we update as necessary before
   * returning to the parent component ready to add to the database.
   */
  let finalChildReadyToAdd: InsertPlant = { ...candidateChild };

  export let onCancel: () => any;
  export let onConfirm: (plantReadyToAdd: InsertPlant) => Promise<void>;

  let textInput = finalChildReadyToAdd.commonName || "";
  let waitingForImage = false;
  let candidateImageUrl: string | null = null;

  function replaceInParagraph(
    paragraph: string | null | undefined,
    target: string | null | undefined,
    replacement: string | null
  ) {
    if (paragraph && target && replacement) {
      return paragraph.split(target).join(replacement) || null;
    } else {
      return null;
    }
  }

  async function handleAction() {
    try {
      finalChildReadyToAdd.commonName = textInput;
      finalChildReadyToAdd.description = replaceInParagraph(
        finalChildReadyToAdd.description,
        finalChildReadyToAdd.commonName,
        textInput
      );
      await onConfirm(finalChildReadyToAdd);
      goto("../gallery");
    } catch (error) {
      console.error("Error during confirmation:", error);
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
  }

  const generateImage = async () => {
    waitingForImage = true;
    const imageGenerationResponse = await fetch("/api/generate/image", {
      method: "POST",
      body: JSON.stringify({
        description: candidateChild.description
      })
    });
    waitingForImage = false;
    if (imageGenerationResponse.status == 200) {
      const json =
        (await imageGenerationResponse.json()) as GeneratedImageResult;
      const { url } = json;
      console.log("got candidate image URL:", url);
      candidateImageUrl = url;
      finalChildReadyToAdd.imageUrl = url;
    } else {
      console.error("Error fetching generated new image");
    }
  };

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

  generateImage();
</script>

<div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green">
  <div class="flex justify-center items-center h-full">
    <div
      class="m-2 p-2 rounded-lg max-w-lg overflow-y-auto"
      style="max-height: calc(100% - 4rem);"
    >
      {#if candidateImageUrl}
        <p class="text-roel_blue text-xl mb-2">
          Hooray you made a new plant. What would you like it to be named?
        </p>
        <TransparencyMaker
          src={candidateImageUrl}
          useFloodFill={false}
          tolerance={TOLERANCE_SIMPLE}
          doUpload={true}
          onUploadComplete={replaceImage}
        />
      {/if}
      {#if waitingForImage}
        <div
          class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center"
        >
          <div class="flex flex-col items-center">
            <img
              src="/spinnerPlant.png"
              alt="Spinner"
              class="w-40 relative animate-spin"
              style="margin: auto;"
            />
            <div
              id="message"
              class="text-roel_blue font-inter text-lg mt-4 text-center mb-2"
            >
              {messages[currentIndex]} ...
            </div>
          </div>
        </div>
      {/if}

      {#if candidateImageUrl}
        <form on:submit|preventDefault={handleSubmit} class="mt-2">
          <div>
            <input
              type="text"
              bind:value={textInput}
              class="border-2 h-10 bg-transparent border-roel_blue rounded-full w-full placeholder:text-center placeholder:text-roel_blue text-center text-roel_blue"
              placeholder="Name your flower"
            />
          </div>
        </form>
        <p class="text-roel_blue mt-2">{candidateChild.description}</p>

        <div class="flex gap-2 flex-nowrap h-10 bg-transparent mt-2">
          <button
            on:click={() => handleAction()}
            class="border-roel_blue border-2 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent w-full text-roel_blue"
            >OK</button
          >
        </div>
        <button
          on:click={onCancel}
          class=" border-roel_green border-2 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent w-full hidden"
          >Cancel</button
        >
      {/if}
    </div>
  </div>
</div>

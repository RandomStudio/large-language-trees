<script lang="ts">
  import { goto } from "$app/navigation";
  import type { GeneratedImageResult, InsertPlant } from "$lib/types";
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
    "the roots are intertwining",
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

<div class=" absolute top-0 left-0 right-0">
  <div class="border bg-roel_blue m-8 p-4 rounded">
    <div class="flex justify-end items-center mb-4">
      <button
        type="button"
        class="bg-transparent text-roel_green font-semibold"
        on:click={onCancel}
        aria-label="Close popup">&times;</button
      >
    </div>
    <p
      class="text-roel_green font-garamond text-3xl mb-6 top-40 right-10 left-10"
    >
      Hooray you made a new plant. What would you like it to be named?
    </p>

    {#if candidateImageUrl}
      <TransparencyMaker
        src={candidateImageUrl}
        useFloodFill={false}
        tolerance={8}
        doUpload={true}
        onUploadComplete={replaceImage}
      />
    {/if}
    {#if waitingForImage}
      <div>
        <div
          id="message"
          class="text-roel_green font-garamond text-2xl mt-32 text-center mb-32"
        >
          {messages[currentIndex]} ...
        </div>
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="mt-4">
      <div>
        <input
          type="text"
          bind:value={textInput}
          class="border-2 h-12 bg-transparent border-roel_green text-roel_green rounded-full w-full placeholder:text-center placeholder:text-roel_green text-center"
          placeholder="Name your flower"
        />
      </div>
    </form>
    <p class=" text-roel_green mt-4">
      {finalChildReadyToAdd.description}
    </p>
    {#if candidateImageUrl}
      <div
        class="flex gap-4 flex-nowrap h-12 bg-transparent text-roel_green mt-4"
      >
        <button
          on:click={() => handleAction()}
          class=" border-roel_green border-2 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent w-full"
          >Add
        </button>
        <button
          on:click={onCancel}
          class=" border-roel_green border-2 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent w-full"
          >Cancel</button
        >
      </div>
    {/if}
  </div>
</div>

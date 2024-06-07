<script lang="ts">
  import { goto } from "$app/navigation";
  import type { GeneratedImageResult, InsertPlant } from "$lib/types";
  import TransparencyMaker from "./TransparencyMaker.svelte";

  export let candidateChild: InsertPlant;

  export let onCancel: () => any;
  export let onConfirm: (
    imageUrl: string | null,
    commonName: string
  ) => Promise<void>;

  let textInput = candidateChild.commonName || "";
  let waitingForImage = false;
  let candidateImageUrl: string | null = null;

  async function handleAction() {
    try {
      await onConfirm(candidateImageUrl, textInput); // Attendre que onConfirm soit terminé
      goto("../gallery"); // Rediriger vers la page de la galerie après confirmation
    } catch (error) {
      console.error("Error during confirmation:", error);
      // Gérer l'erreur éventuelle ici, par exemple afficher un message à l'utilisateur
    }
  }

  function handleSubmit() {
    if (textInput.trim() === "") {
      console.log("Please write something");
      return;
    }

    console.log("Name given:", textInput);

    if (candidateChild.description && candidateChild.commonName) {
    }
    candidateChild.commonName = textInput;
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

<div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green">
  <div class="flex justify-center items-center h-full">
    <div
      class="m-2 p-2 rounded-lg max-w-lg overflow-y-auto"
      style="max-height: calc(100% - 4rem);"
    >
      <p class="text-roel_blue text-xl mb-2">
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
            class="text-roel_blue font-inter text-lg mt-2 text-center mb-2"
          >
            {messages[currentIndex]} ...
          </div>
        </div>
      {/if}

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
      {#if candidateImageUrl}
        <div class="flex gap-2 flex-nowrap h-10 bg-transparent mt-2">
          <button
            on:click={() => handleAction()}
            class="border-roel_blue border-2 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent w-full text-roel_blue"
            >OK</button
          >
        </div>
      {/if}
    </div>
  </div>
</div>

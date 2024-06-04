<script lang="ts">
  import type { GeneratedImageResult, InsertPlant } from "$lib/types";
  import Spinner from "./Spinner.svelte";
  import TransparencyMaker from "./TransparencyMaker.svelte";

  export let candidateChild: InsertPlant;

  export let onCancel: () => any;
  export let onConfirm: (imageUrl: string | null) => Promise<void>;

  let textInput = candidateChild.commonName || "";
  let waitingForImage = false;
  let candidateImageUrl: string | null = null;

  function replaceWordInText(
    text: string,
    targetWord: string,
    newWord: string
  ) {
    const regex = new RegExp(`\\b${targetWord}\\b`, "gi");
    return text.replace(regex, newWord);
  }

  function handleSubmit() {
    if (textInput.trim() === "") {
      console.log("Please write something");
      return;
    }

    console.log("Name given:", textInput);

    if (candidateChild.description && candidateChild.commonName) {
      candidateChild.description = replaceWordInText(
        candidateChild.description,
        candidateChild.commonName,
        textInput
      );
    }
    candidateChild.commonName = textInput;
  }

  const generateImage = async () => {
    waitingForImage = true;
    const imageGenerationResponse = await fetch("/api/generate/image", {
      method: "POST",
      body: JSON.stringify({
        description: candidateChild.description,
      }),
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
    "Flowers are budding",
  ];
  let currentIndex = 0;

  setInterval(() => {
    if (currentIndex < messages.length - 1) {
      currentIndex = (currentIndex + 1) % messages.length;
    }
  }, 3000);
</script>

<div class="fixed top-0 left-0 right-0">
  <div class="border bg-slate-100 m-8 p-4 rounded">
    <h1 class="text-xl font-bold">New plant!</h1>
    {#if candidateImageUrl}
      <!-- <img src={candidateImage} alt="AI generated new plant" class="max-w-20" /> -->
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
        <div id="message">{messages[currentIndex]}</div>
        <Spinner />
      </div>
    {:else}
      <div>
        <button
          on:click={generateImage}
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          >Generate image</button
        >
      </div>
    {/if}
    <h2>{candidateChild.id}</h2>
    <p class="text-sm">
      {candidateChild.description}
    </p>
    <p>Name your discovered flower</p>
    <form on:submit|preventDefault={handleSubmit}>
      <div>
        <input type="text" bind:value={textInput} class="border" />
        <button
          type="submit"
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          >Rename</button
        >
      </div>
    </form>
    <div>
      <button
        on:click={() => onConfirm(candidateImageUrl)}
        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >✅ Add
      </button>
      <button
        on:click={onCancel}
        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >❌ Cancel</button
      >
    </div>
  </div>
</div>

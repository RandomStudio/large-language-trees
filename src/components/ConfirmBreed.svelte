<script lang="ts">
  import type { InsertPlant, SelectPlant } from "$lib/types";
  import Spinner from "./Spinner.svelte";

  export let candidateChild: InsertPlant;

  export let onCancel: () => any;
  export let onConfirm: (imageURL: string | null) => any;

  let waitingForImage = false;
  let candidateImage: string | null = null;

  const generateImage = async () => {
    waitingForImage = true;
    const res = await fetch("/api/generate/image", {
      method: "POST",
      body: JSON.stringify({
        description: candidateChild.description,
      }),
    });
    waitingForImage = false;
    if (res.status == 200) {
      const json = await res.json();
      const { url } = json;
      console.log("got candidate image URL:", url);
      candidateImage = url;
    } else {
      console.error("Error fetching generated new image");
    }
  };
</script>

<div class="overlay">
  <div class="popup">
    <h1>New plant!</h1>
    {#if candidateImage}
      <img src={candidateImage} alt="AI generated new plant" />
    {:else}
      <button on:click={generateImage}>Generate</button>
    {/if}
    {#if waitingForImage}
      <div>
        <div>Generating image...</div>
        <Spinner />
      </div>
    {/if}
    <p>
      Details: <code>{JSON.stringify(candidateChild)}</code>
    </p>
    <div>
      <button on:click={() => onConfirm(candidateImage)}>✅ Add </button>
      <button on:click={onCancel}>❌ Cancel</button>
    </div>
  </div>
</div>

<style>
  @import "./popups.css";
</style>

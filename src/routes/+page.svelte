<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import {
    convertWebPToPNG,
    removeBackgroundColor,
  } from "../components/ImageTransformer.svelte";

  let showButton = false;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    showButton = input.value.length > 0;
  }

  onMount(async () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = 150;
    canvas.height = 150;
    canvas.setAttribute("data-image-url", "/plants/Acacia.webp");

    try {
      const pngUrl = await convertWebPToPNG(canvas);
      removeBackgroundColor(canvas, 25); // Apply background removal with tolerance
      document.getElementById("displayImage").src = pngUrl;
    } catch (error) {
      console.error("Failed to process image:", error);
    }
  });
</script>

<div
  class="flex items-center justify-center min-h-screen bg-green-300 overflow-hidden"
>
  <main class="mx-10 w-full max-w-4xl">
    <div class="text-left">
      <h1 class="text-3xl text-blue-600">The Garden</h1>
    </div>
    <div class="flex justify-center space-x-4 my-8">
      <canvas id="canvas" style="display:none;"></canvas>
      <img id="displayImage" alt="Converted Image" style="display:block;" />
    </div>
    <form class="mt-8 text-center" style="min-height: 100px;">
      <!-- Adjust the min-height as needed -->
      <input
        class="bg-transparent text-blue-600 py-2 px-4 border border-blue-500 rounded-full placeholder-blue-600 focus:outline-none focus:border-blue-500"
        type="text"
        id="fname"
        name="fname"
        placeholder="Fill in your name"
        style="width:250px"
        on:input={handleInput}
      /><br />
      {#if showButton}
        <button
          on:click={() => goto("/signup")}
          class="bg-transparent text-blue-600 font-semibold py-2 px-4 border-4 border-blue-500 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
          style="width:250px;">Start</button
        >
      {/if}
    </form>
    <div class="text-left mt-4">
      <p class="text-blue-600">
        Welcome to the common garden of Lucullus. This Digital Common Garden is
        about connection and cross-pollination.<br /><br />
        Find other Gardeners to start cross-breeding and witness the offspring flourish
        in the common garden of Lucullus.
      </p>
      <br />
      <div class="text-left">
        <span class="text-blue-600 font-semibold">Production:</span><br />
        <span class="text-blue-600">Studio Random</span><br />
        <span class="text-blue-600 font-semibold">Image Data:</span><br />
        <span class="text-blue-600">Chat GPT/ Open AI</span><br /><br />
      </div>
    </div>
  </main>
</div>

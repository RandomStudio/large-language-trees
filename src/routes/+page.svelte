<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import ImageTransformer from "../components/ImageTransformer.svelte";
  let showButton = false;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    showButton = input.value.length > 0;
  }

  onMount(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const img = new Image();

    img.onload = () => {
      canvas.width = 150;
      canvas.height = 150;
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height,
      );
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const xOffset = (canvas.width - scaledWidth) / 2;
      const yOffset = (canvas.height - scaledHeight) / 2;
      context.drawImage(img, xOffset, yOffset, scaledWidth, scaledHeight);
      const topLeftColor = context.getImageData(0, 0, 1, 1).data;
      const tolerance = 25;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (
          isWithinTolerance(
            [data[i], data[i + 1], data[i + 2]],
            [topLeftColor[0], topLeftColor[1], topLeftColor[2]],
            tolerance,
          )
        ) {
          data[i + 3] = 0;
        }
      }
      context.putImageData(imageData, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      document.getElementById("displayImage").src = pngUrl;
    };

    img.src = "/plants/Acacia.webp"; // Load the .webp image
  });

  function isWithinTolerance(pixelColor, targetColor, tolerance) {
    return (
      Math.abs(pixelColor[0] - targetColor[0]) <= tolerance &&
      Math.abs(pixelColor[1] - targetColor[1]) <= tolerance &&
      Math.abs(pixelColor[2] - targetColor[2]) <= tolerance
    );
  }
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
          class="bg-transparent text-blue-600 font-semibold py-2 px-4 border-2 border-blue-500 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
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
  <ImageTransformer />
</div>

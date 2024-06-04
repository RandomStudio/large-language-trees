<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { ActionData } from "./$types";
  import { onMount } from "svelte";

  export let form: ActionData;

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
      canvas.width = 350;
      canvas.height = 350;
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

    img.src = "/titleimg.png"; // Load the .webp image
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
  class="flex items-center justify-center min-h-screen bg-roel_green overflow-hidden"
>
  <main class="mx-10 w-full max-w-4xl">
    <div class="flex justify-center space-x-4 my-8">
      <canvas id="canvas" style="display:none;"></canvas>
      <img id="displayImage" alt="Converted Image" style="display:block;" />
    </div>

    <form
      method="post"
      use:enhance
      class="mt-8 text-center"
      style="min-height: 100px;"
    >
      <input
        class="bg-roel_green text-roel_blue py-2 px-4 border border-roel_blue rounded-full placeholder-roel_blue focus:outline-none focus:border-roel_blue"
        type="text"
        id="username"
        name="username"
        placeholder="Fill in your name"
        style="width:250px"
        on:input={handleInput}
      /><br />
      <input
        class="bg-roel_green text-roel_blue py-2 px-4 border border-roel_blue rounded-full placeholder-roel_blue focus:outline-none focus:border-roel_blue mt-2"
        type="password"
        id="password"
        name="password"
        placeholder="Password"
        style="width:250px"
      /><br />
      <button
        class="bg-roel_green text-roel_blue font-semibold py-2 px-4 border-2 border-roel_blue rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
        style="width:250px;"
        type="submit"
      >
        Continue
      </button>
      <button
        class="bg-transparent text-roel_blue font-semibold py-2 px-4 border-2 border-roel_blue rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
        style="width:250px;"
        on:click={() => {
          goto("/signup");
        }}
      >
        Register
      </button>
    </form>

    {#if form?.message}
      <div class="text-roel_blue">
        Error: {form.message}
      </div>
    {/if}

    <div class="text-left mt-4">
      <p class="text-roel_blue">
        Welcome to the common garden of Lucullus. This Digital Common Garden is
        about connection and cross-pollination.<br /><br />
        Find other Gardeners to start cross-breeding and witness the offspring flourish
        in the common garden of Lucullus.
      </p>
      <br />
      <div class="text-left">
        <span class="text-roel_blue font-semibold">Production:</span><br />
        <span class="text-roel_blue">Studio Random</span><br />
        <span class="text-roel_blue font-semibold">Image Data:</span><br />
        <span class="text-roel_blue">Chat GPT/ Open AI</span><br /><br />
      </div>
    </div>
  </main>
</div>

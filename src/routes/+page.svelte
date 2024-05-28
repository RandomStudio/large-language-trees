<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { backIn } from "svelte/easing";

  // Define variables to control the fill speed and selected colour
  let fillSpeed = "slow";
  let selectedColour = "#FF0000";

  onMount(() => {
    // Load the image into the canvas and set up the functionality
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set the canvas size to match the image size
      canvas.width = 200;
      canvas.height = 200;

      // Scale the image to fit inside the canvas
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height,
      );
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;

      context.drawImage(img, 0, 0, newWidth, newHeight);

      // Get the color of the top left pixel
      const colorData = context.getImageData(0, 0, 1, 1).data;
      console.log(colorData);
      //const colorDataRange = [colorData +10
      const backgroundColor = [colorData[0], colorData[1], colorData[2]];

      // Call the function to remove background color
      removeBackgroundColor(canvas, context, backgroundColor);
    };

    img.src = "/plants/Bamboo.png"; // Replace with your image path
  });

  function removeBackgroundColor(canvas, context, backgroundColor) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;
    console.log(data.len);
    // Iterate through each pixel and remove the background color
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Check if the pixel color matches the background color
      if (r >= 230 && g >= 230 && b >= 230) {
        // Set the alpha channel to 0 to make it transparent
        data[i + 3] = 0;
      }
    }

    // Put the modified image data back onto the canvas
    context.putImageData(imageData, 0, 0);
  }
</script>

<div
  class="flex items-center justify-center min-h-screen bg-green-300 overflow-hidden"
>
  <main class="text-left mx-1.5">
    <h1 class="text-3xl text-blue-600">The Garden</h1>

    <div>
      <div class="flex justify-center space-x-4">
        <canvas id="canvas"></canvas>
      </div>
      <br />
    </div>
    <div class="text-center">
      <p class="text-blue-600">
        Welcome to the common garden of Lucullus. This Digital Common Garden is
        about connection and cross-pollination.
        <br />
        <br />Find other Gardeners to start cross-breeding and witness the
        offspring flourish in the common garden of Lucullus.
      </p>
    </div>
    <br />
    <span class="text-blue-600 font-semibold">Production:</span>
    <br />
    <span class="text-blue-600">Studio Random</span>
    <br />
    <span class="text-blue-600 font-semibold">Image Data:</span>
    <br />
    <span class="text-blue-600">Chat GPT/ Open AI</span>
    <br />
    <br />
  </main>
</div>

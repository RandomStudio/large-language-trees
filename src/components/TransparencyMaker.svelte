<script lang="ts">
  import type { ImageUploadResult } from "$lib/types";
  import { onMount } from "svelte";

  export let src: string;
  export let tolerance = 15;
  export let useFloodFill = true;

  export let onUploadComplete: (imageUrl: string) => any;

  let canvasElement: HTMLCanvasElement;

  export let doUpload: boolean = false;

  onMount(async () => {
    // This nonsense is necessary because otherwise "window" is not defined
    // when Sveltekit tries to do server-side rendering
    const ff = await import("q-floodfill");
    const FloodFill = ff.default;

    const img = new Image();

    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(
          1,
          1,
          canvasElement.width,
          canvasElement.height
        );
        const topLeftColor = ctx.getImageData(0, 0, 1, 1).data;

        const [r, g, b, a] = topLeftColor;
        console.log({ topLeftColor, r, g, b, a });

        if (useFloodFill) {
          const floodFill = new FloodFill(imageData);
          floodFill.fill("rgba(0,0,0,0)", 0, 0, tolerance);

          const count = floodFill.modifiedPixelsCount;

          console.log("modified", count, "pixels ok using floodfill");
        } else {
          let count = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            if (
              isWithinTolerance(
                [
                  imageData.data[i],
                  imageData.data[i + 1],
                  imageData.data[i + 2]
                ],
                [topLeftColor[0], topLeftColor[1], topLeftColor[2]],
                tolerance
              )
            ) {
              count++;
              imageData.data[i + 3] = 0; // Set alpha to 0, making the pixel transparent.
              // data[i] = 1;
            }
          }
          console.log("altered", count, "pixels use simple replace");
        }

        ctx.putImageData(imageData, 0, 0);

        canvasElement.toBlob(async (blob) => {
          if (doUpload && blob) {
            console.log("look, a Blob:", blob);
            const formData = new FormData();
            formData.append("img", blob);

            const res = await fetch(`/api/upload/image`, {
              method: "POST",
              body: formData
            });
            console.log("response to upload:", res);
            const json = (await res.json()) as ImageUploadResult;
            const { url } = json;
            console.log("The URL for the new (transparent) image is", url);
            onUploadComplete(url);
          }
        }, "image/png");
      }
    };

    img.src = src;
    // img.setAttribute("crossOrigin", "");
    img.crossOrigin = "";
    const ctx = canvasElement.getContext("2d");
  });

  function isWithinTolerance(
    pixelColor: Array<number>,
    targetColor: Array<number>,
    tolerance: number
  ) {
    return (
      Math.abs(pixelColor[0] - targetColor[0]) <= tolerance &&
      Math.abs(pixelColor[1] - targetColor[1]) <= tolerance &&
      Math.abs(pixelColor[2] - targetColor[2]) <= tolerance
    );
  }
</script>

<div class="">
  <canvas
    bind:this={canvasElement}
    width="1024"
    height="1024"
    class="w-full md:w-6/12"
  />
</div>

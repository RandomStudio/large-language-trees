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
    const { default: FloodFill } = await import("q-floodfill");

    const img = new Image();

    img.onload = () => {
      const ctx = canvasElement.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );

        // First replacement: edge pixel (0, 0)
        replaceColor(0, 0, imageData, ctx, tolerance, useFloodFill, FloodFill);

        // Second replacement: pixel at 6% away from both x and y axes
        const x = Math.floor(canvasElement.width * 0.06);
        const y = Math.floor(canvasElement.height * 0.06);
        replaceColor(x, y, imageData, ctx, tolerance, useFloodFill, FloodFill);

        canvasElement.toBlob(async (blob) => {
          if (doUpload && blob) {
            console.log("look, a Blob:", blob);
            const formData = new FormData();
            formData.append("img", blob);

            const res = await fetch(`/api/images/upload`, {
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
    img.crossOrigin = "anonymous";
  });

  function replaceColor(
    x: number,
    y: number,
    imageData: ImageData,
    ctx: CanvasRenderingContext2D,
    tolerance: number,
    useFloodFill: boolean,
    FloodFill: any
  ) {
    const pixelColor = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b, a] = pixelColor;
    console.log(`Selected pixel color at (${x}, ${y}):`, { r, g, b, a });

    if (useFloodFill) {
      const floodFill = new FloodFill(imageData);
      floodFill.fill("rgba(0,0,0,0)", x, y, tolerance);

      const count = floodFill.modifiedPixelsCount;
      console.log("Modified", count, "pixels using floodfill");
    } else {
      let count = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (
          isWithinTolerance(
            [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]],
            [r, g, b],
            tolerance
          )
        ) {
          count++;
          imageData.data[i + 3] = 0; // Set alpha to 0, making the pixel transparent.
        }
      }
      console.log("Altered", count, "pixels using simple replace");
    }

    ctx.putImageData(imageData, 0, 0);
  }

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

<div>
  <canvas
    bind:this={canvasElement}
    width="1024"
    height="1024"
    class="w-full md:w-6/12"
  />
</div>

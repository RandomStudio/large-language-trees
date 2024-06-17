<script lang="ts">
  import type { ImageUploadResult } from "$lib/types";
  import { onMount } from "svelte";

  export let src: string;
  export let tolerance = 2.5; // Further decreased tolerance for less aggressive flood fill
  export let useFloodFill = true;

  export let onUploadComplete: (imageUrl: string) => any;

  let canvasElement: HTMLCanvasElement;

  export let doUpload: boolean = false;

  onMount(async () => {
    const { default: FloodFill } = await import("q-floodfill");

    const img = new Image();

    img.onload = () => {
      console.log("Image URL before transformation:", img.src);
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

        // Remove white pixels
        removeWhitePixels(imageData, ctx, 12); // Adjusted tolerance to a smaller range

        // Remove disconnected pixels
        removeDisconnectedPixels(imageData, ctx, FloodFill);

        // Convert canvas to data URL and log it
        const transformedImageUrl = canvasElement.toDataURL("image/png");
        console.log("Image URL after transformation:", transformedImageUrl);

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
      floodFill.fill("rgba(0,0,0,0)", x, y, tolerance, [r, g, b, a]);

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

  function removeWhitePixels(
    imageData: ImageData,
    ctx: CanvasRenderingContext2D,
    tolerance: number
  ) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (
        isWhiteWithinTolerance([data[i], data[i + 1], data[i + 2]], tolerance)
      ) {
        data[i + 3] = 0; // Make the pixel fully transparent
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function isWhiteWithinTolerance(
    pixelColor: Array<number>,
    tolerance: number
  ) {
    return (
      Math.abs(255 - pixelColor[0]) <= tolerance &&
      Math.abs(255 - pixelColor[1]) <= tolerance &&
      Math.abs(255 - pixelColor[2]) <= tolerance
    );
  }

  function removeDisconnectedPixels(
    imageData: ImageData,
    ctx: CanvasRenderingContext2D,
    FloodFill: any
  ) {
    const width = canvasElement.width;
    const height = canvasElement.height;
    const centralX = Math.floor(width / 2);
    const centralY = Math.floor(height / 2);

    // Create a mask for connected components
    const mask = new Uint8Array(imageData.data.length / 4);

    // Flood fill from the center
    const stack = [[centralX, centralY]];

    while (stack.length) {
      const [x, y] = stack.pop()!;
      const index = (y * width + x) * 4;
      if (
        imageData.data[index + 3] !== 0 && // Ensure the pixel is not already transparent
        mask[index / 4] === 0
      ) {
        mask[index / 4] = 1;
        if (x > 0) stack.push([x - 1, y]);
        if (x < width - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < height - 1) stack.push([x, y + 1]);
      }
    }

    // Set all pixels not in the connected component to transparent
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (mask[i / 4] === 0) {
        imageData.data[i + 3] = 0; // Make the pixel fully transparent
      }
    }

    ctx.putImageData(imageData, 0, 0);
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

<script lang="ts">
  import type { ImageUploadResult } from "$lib/types";
  import { onMount } from "svelte";

  export let src: string;
  export let tolerance = 2.8;
  export let useFloodFill = true;

  export let onUploadComplete: (imageUrl: string) => any;

  let canvasElement: HTMLCanvasElement;

  export let doUpload: boolean = false;

  onMount(async () => {
    const { default: FloodFill } = await import("q-floodfill");

    const img = new Image();

    img.onload = () => {
      console.log("Image URL before transformation:", img.src);
      const ctx = canvasElement.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0);

        let imageData = ctx.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );

        if (
          !processRound(
            imageData,
            ctx,
            tolerance,
            useFloodFill,
            FloodFill,
            0,
            0
          )
        ) {
          console.log("First round failed. Exiting.");
          return;
        }

        imageData = ctx.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        const x1 = Math.floor(canvasElement.width * 0.06);
        const y1 = Math.floor(canvasElement.height * 0.06);
        if (
          !processRound(
            imageData,
            ctx,
            tolerance,
            useFloodFill,
            FloodFill,
            x1,
            y1
          )
        ) {
          console.log("Second round failed. Exiting.");
          return;
        }

        imageData = ctx.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        const x2 = Math.floor(canvasElement.width * 0.94);
        const y2 = Math.floor(canvasElement.height * 0.94);
        if (!processRound(imageData, ctx, tolerance, false, null, x2, y2)) {
          console.log("Third round failed. Exiting.");
          return;
        }

        removeWhitePixels(imageData, ctx, 12);
        removeDisconnectedPixels(imageData, ctx, FloodFill, tolerance);

        if (isCanvasTransparent(imageData)) {
          console.log(
            "Canvas is transparent after processing. Retrying with less aggressive settings."
          );
          imageData = ctx.getImageData(
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );
          if (
            !processRound(imageData, ctx, tolerance - 0.5, false, null, 0, 0)
          ) {
            console.log("Retry failed. Exiting.");
            return;
          }
        }

        ctx.putImageData(imageData, 0, 0);
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

  function processRound(
    imageData: ImageData,
    ctx: CanvasRenderingContext2D,
    tolerance: number,
    useFloodFill: boolean,
    FloodFill: any,
    x: number,
    y: number
  ): boolean {
    replaceColor(x, y, imageData, ctx, tolerance, useFloodFill, FloodFill);

    if (isCanvasTransparent(imageData)) {
      console.log(
        `Canvas became transparent after processing round at (${x}, ${y}).`
      );
      return false;
    }

    ctx.putImageData(imageData, 0, 0);
    return true;
  }

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

    if (useFloodFill && FloodFill) {
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
          imageData.data[i + 3] = 0;
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
        data[i + 3] = 0;
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
    FloodFill: any,
    tolerance: number
  ) {
    const width = canvasElement.width;
    const height = canvasElement.height;
    const centralX = Math.floor(width / 2);
    const centralY = Math.floor(height / 2);

    const mask = new Uint8Array(imageData.data.length / 4);
    const stack = [[centralX, centralY]];

    while (stack.length) {
      const [x, y] = stack.pop()!;
      const index = (y * width + x) * 4;
      if (imageData.data[index + 3] !== 0 && mask[index / 4] === 0) {
        mask[index / 4] = 1;
        if (x > 0) stack.push([x - 1, y]);
        if (x < width - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < height - 1) stack.push([x, y + 1]);
      }
    }

    for (let i = 0; i < imageData.data.length; i += 4) {
      if (mask[i / 4] === 0) {
        imageData.data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function isCanvasTransparent(imageData: ImageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] !== 0) {
        return false;
      }
    }
    return true;
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

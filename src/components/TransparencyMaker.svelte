<script lang="ts">
  import type { ImageUploadResult } from "$lib/types";
  import { onMount } from "svelte";

  export let src: string;
  export let tolerance = 40;
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

        let listCorners = [
          [0, 0],
          [0.5, 0],
          [0.03, 0.03]
        ];

        for (let i = 0; i < listCorners.length; i++) {
          console.log("round " + i);
          let corner = listCorners[i];
          if (corner.length >= 2) {
            let x = Math.floor(canvasElement.width * corner[corner.length - 2]);
            let y = Math.floor(
              canvasElement.height * corner[corner.length - 1]
            );

            console.log(`Processing corner (${x}, ${y})`);
            if (
              !processRound(
                imageData,
                ctx,
                tolerance,
                useFloodFill,
                FloodFill,
                x,
                y
              )
            ) {
              console.log(`Processing failed at corner (${x}, ${y}).`);
            }
          } else {
            console.log(`Insufficient data for corner index ${i}.`);
          }
        }

        imageData = ctx.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );

        console.log(imageData);

        //Checking round
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

        removeDisconnectedPixels(imageData, ctx);

        removeWhitePixels(imageData, ctx, 10);

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
            [
              imageData.data[i],
              imageData.data[i + 1],
              imageData.data[i + 2],
              imageData.data[i + 3]
            ],
            [r, g, b],
            tolerance
          ) &&
          a != 0
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

  function removeDisconnectedPixels(
    imageData: ImageData,
    ctx: CanvasRenderingContext2D
  ) {
    const width = imageData.width;
    const height = imageData.height;

    const mask = new Uint32Array(imageData.data.length / 4);
    let regionId = 0;
    let regionSizes = [];

    function floodFill(x: number, y: number, id: number): number {
      const stack: Array<[number, number]> = [[x, y]];
      let size = 0;

      while (stack.length > 0) {
        const popped = stack.pop();
        if (popped === undefined) {
          continue; // Skip this iteration if popped is undefined
        }

        const [cx, cy] = popped;
        const index = (cy * width + cx) * 4;
        if (mask[cx + cy * width] === 0 && imageData.data[index + 3] !== 0) {
          // Check if not already visited and pixel is visible
          mask[cx + cy * width] = id;
          size++;

          // Check neighbors
          if (cx > 0 && mask[cx - 1 + cy * width] === 0)
            stack.push([cx - 1, cy]);
          if (cx < width - 1 && mask[cx + 1 + cy * width] === 0)
            stack.push([cx + 1, cy]);
          if (cy > 0 && mask[cx + (cy - 1) * width] === 0)
            stack.push([cx, cy - 1]);
          if (cy < height - 1 && mask[cx + (cy + 1) * width] === 0)
            stack.push([cx, cy + 1]);
        }
      }
      return size;
    }

    // Discover all regions and their sizes
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (
          mask[x + y * width] === 0 &&
          imageData.data[(y * width + x) * 4 + 3] !== 0
        ) {
          regionId++;
          const size = floodFill(x, y, regionId);
          regionSizes.push(size);
        }
      }
    }

    // Additional logic would go here to handle region sizes, etc.
    ctx.putImageData(imageData, 0, 0);
  }

  function removeWhitePixels(
    imageData: ImageData,
    ctx: CanvasRenderingContext2D,
    tolerance: number
  ) {
    const targetColor = [255, 255, 255, 255];
    let count = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelColor = [
        imageData.data[i], // R
        imageData.data[i + 1], // G
        imageData.data[i + 2], // B
        imageData.data[i + 3] // A
      ];

      if (isWithinTolerance(pixelColor, targetColor, tolerance)) {
        imageData.data[i + 3] = 0;
        count++;
      }
    }
    console.log("Altered", count, "white pixels to transparent");

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

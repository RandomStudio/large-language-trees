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
      //Source image
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
          [0.03, 0.03],
          [0.5, 0],
          [0, 0.5],
          [0, 0.99],
          [0.99, 0],
          [0.99, 0.99]
        ];

        //Removing the color of all the points in the listCorners
        for (let i = 0; i < listCorners.length; i++) {
          console.log("round " + i);
          let corner = listCorners[i];
          if (corner.length >= 2) {
            let x = Math.floor(canvasElement.width * corner[0]);
            let y = Math.floor(canvasElement.height * corner[1]);
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

        //removing all the disconected pixels
        removeDisconnectedPixels(imageData, ctx);

        //Remove the outside white pixels
        removeBorderConnectedLightPixels(imageData, ctx, 50);

        //filling the holes with white
        fillHolesInImage(imageData, ctx, 60);

        //removing all the disconected pixels
        removeDisconnectedPixels(imageData, ctx);

        //Pixelate
        pixelateImage(imageData, ctx);

        //add borders in dark blue
        //addBorders(imageData, ctx);

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
    // Helper function to perform a flood fill using a stack
    function floodFill(x: number, y: number, id: number) {
      const stack = [[x, y]];
      let size = 0;
      while (stack.length) {
        const [cx, cy] = stack.pop();
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
    // Determine the largest region
    let largestRegionId = 0;
    let maxRegionSize = 0;
    for (let i = 0; i < regionSizes.length; i++) {
      if (regionSizes[i] > maxRegionSize) {
        maxRegionSize = regionSizes[i];
        largestRegionId = i + 1;
      }
    }
    // Clear pixels not in the largest region
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] !== largestRegionId) {
        imageData.data[i * 4 + 3] = 0; // Set alpha to 0, making the pixel transparent
      }
    }
    // Update the canvas
    ctx.putImageData(imageData, 0, 0);
  }

  function fillHolesInImage(
    imageData: ImageData,
    ctx: CanvasRenderingContext2D,
    difference: number
  ) {
    const width = imageData.width;
    const height = imageData.height;
    const mask = new Uint32Array(imageData.data.length / 4);

    // Helper function to calculate the color difference from white
    function colorDifferenceFromWhite(pixelColor: number[]): number {
      const whiteColor = [255, 255, 255];
      return (
        (Math.abs(pixelColor[0] - whiteColor[0]) +
          Math.abs(pixelColor[1] - whiteColor[1]) +
          Math.abs(pixelColor[2] - whiteColor[2])) /
        3
      );
    }

    // Helper function to get the border pixels and calculate the average color difference from white
    function averageBorderDifference(holePixels: [number, number][]): number {
      let totalDifference = 0;
      let count = 0;

      for (const [hx, hy] of holePixels) {
        const neighbors = [
          [hx - 1, hy],
          [hx + 1, hy],
          [hx, hy - 1],
          [hx, hy + 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const index = (ny * width + nx) * 4;
            if (imageData.data[index + 3] !== 0) {
              // Non-transparent pixel
              const pixelColor = [
                imageData.data[index],
                imageData.data[index + 1],
                imageData.data[index + 2]
              ];
              totalDifference += colorDifferenceFromWhite(pixelColor);
              count++;
            }
          }
        }
      }
      console.log(
        "The color difference of the hole is" + totalDifference / count
      );
      return count > 0 ? totalDifference / count : 0;
    }

    // Helper function to perform a flood fill to find holes
    function floodFill(x: number, y: number) {
      const stack: [number, number][] = [[x, y]];
      const holePixels: [number, number][] = [];
      let isHole = true;

      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        const index = (cy * width + cx) * 4;

        if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
          isHole = false; // Reached edge, not a hole
          continue;
        }

        if (mask[cx + cy * width] === 0 && imageData.data[index + 3] === 0) {
          // Mark the pixel as visited and add to holePixels
          mask[cx + cy * width] = 1;
          holePixels.push([cx, cy]);

          // Check neighbors
          stack.push([cx - 1, cy]);
          stack.push([cx + 1, cy]);
          stack.push([cx, cy - 1]);
          stack.push([cx, cy + 1]);
        }
      }

      if (isHole) {
        const avgDifference = averageBorderDifference(holePixels);
        if (avgDifference <= difference) {
          // Fill the hole with white color if the average difference is low
          for (const [hx, hy] of holePixels) {
            const holeIndex = (hy * width + hx) * 4;
            imageData.data[holeIndex] = 255; // R
            imageData.data[holeIndex + 1] = 255; // G
            imageData.data[holeIndex + 2] = 255; // B
            imageData.data[holeIndex + 3] = 255; // A
          }
        }
      }
    }

    // Scan through the image to find and fill holes
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (mask[x + y * width] === 0 && imageData.data[index + 3] === 0) {
          // Start flood fill to find and fill holes
          floodFill(x, y);
        }
      }
    }

    // Update the canvas
    ctx.putImageData(imageData, 0, 0);
  }

  function removeBorderConnectedLightPixels(
    imageData: ImageData,
    ctx: CanvasRenderingContext2D,
    tolerance: number
  ) {
    const width = imageData.width;
    const height = imageData.height;
    const mask = new Uint32Array(imageData.data.length / 4);
    const targetColor = [255, 255, 255]; // Black color

    // Helper function to check if a pixel color is within the tolerance of the target color
    function isWithinTolerance(
      pixelColor: number[],
      targetColor: number[],
      tolerance: number
    ) {
      return (
        Math.abs(pixelColor[0] - targetColor[0]) <= tolerance &&
        Math.abs(pixelColor[1] - targetColor[1]) <= tolerance &&
        Math.abs(pixelColor[2] - targetColor[2]) <= tolerance
      );
    }

    // Helper function to perform a flood fill to remove dark pixels connected to object borders
    function floodFill(x: number, y: number) {
      const stack: [number, number][] = [[x, y]];
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        const index = (cy * width + cx) * 4;

        if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
          continue;
        }

        const pixelColor = [
          imageData.data[index],
          imageData.data[index + 1],
          imageData.data[index + 2]
        ];

        if (
          mask[cx + cy * width] === 0 &&
          isWithinTolerance(pixelColor, targetColor, tolerance) &&
          imageData.data[index + 3] === 255
        ) {
          // Mark the pixel as visited and set it to transparent
          mask[cx + cy * width] = 1;
          imageData.data[index + 3] = 0; // Set alpha to 0, making the pixel transparent

          // Check neighbors
          stack.push([cx - 1, cy]);
          stack.push([cx + 1, cy]);
          stack.push([cx, cy - 1]);
          stack.push([cx, cy + 1]);
        }
      }
    }

    // Identify the borders of the non-transparent object
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (imageData.data[index + 3] === 255) {
          // Non-transparent pixel
          if (
            (x > 0 && imageData.data[(y * width + (x - 1)) * 4 + 3] === 0) || // Left neighbor transparent
            (x < width - 1 &&
              imageData.data[(y * width + (x + 1)) * 4 + 3] === 0) || // Right neighbor transparent
            (y > 0 && imageData.data[((y - 1) * width + x) * 4 + 3] === 0) || // Top neighbor transparent
            (y < height - 1 &&
              imageData.data[((y + 1) * width + x) * 4 + 3] === 0) // Bottom neighbor transparent
          ) {
            floodFill(x, y);
          }
        }
      }
    }

    // Update the canvas
    ctx.putImageData(imageData, 0, 0);
  }

  function pixelateImage(imageData: ImageData, ctx: CanvasRenderingContext2D) {
    const width = imageData.width;
    const height = imageData.height;
    const pixelSize = 8; // 1024 / 128 = 8

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        // Get the middle pixel of the current block
        const midX = x + Math.floor(pixelSize / 2);
        const midY = y + Math.floor(pixelSize / 2);
        const midIndex = (midY * width + midX) * 4;

        // Get the color of the middle pixel
        let r = imageData.data[midIndex];
        let g = imageData.data[midIndex + 1];
        let b = imageData.data[midIndex + 2];
        let a = imageData.data[midIndex + 3];

        if (a === 0) {
          // Middle pixel is transparent
          let allTransparent = true;
          let foundNonTransparent = false;

          // Check all pixels within the block
          for (let py = 0; py < pixelSize && !foundNonTransparent; py++) {
            for (let px = 0; px < pixelSize && !foundNonTransparent; px++) {
              const index = ((y + py) * width + (x + px)) * 4;
              if (imageData.data[index + 3] !== 0) {
                // Found a non-transparent pixel
                r = imageData.data[index];
                g = imageData.data[index + 1];
                b = imageData.data[index + 2];
                a = imageData.data[index + 3];
                foundNonTransparent = true;
                allTransparent = false;
              }
            }
          }

          if (allTransparent) {
            // All pixels within the block are transparent
            r = 0;
            g = 0;
            b = 0;
            a = 0;
          }
        }

        // Apply the determined color to the entire block
        for (let py = 0; py < pixelSize; py++) {
          for (let px = 0; px < pixelSize; px++) {
            const index = ((y + py) * width + (x + px)) * 4;
            imageData.data[index] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
            imageData.data[index + 3] = a;
          }
        }
      }
    }

    // Update the canvas
    ctx.putImageData(imageData, 0, 0);
  }

  function addBorders(
    imageData: ImageData,
    ctx: CanvasRenderingContext2D,
    pixelSize: number = 8
  ) {
    const width = imageData.width;
    const height = imageData.height;
    const borderColor = [0, 4, 40, 255]; // Color of the border
    const modifications: Array<[number, number, number[]]> = [];

    // Helper function to check if a pixel is non-transparent
    function isNonTransparent(x: number, y: number): boolean {
      const index = (y * width + x) * 4;
      return imageData.data[index + 3] !== 0;
    }

    // Helper function to set the color of a pixel
    function setPixelColor(x: number, y: number, color: number[]) {
      const index = (y * width + x) * 4;
      imageData.data[index] = color[0];
      imageData.data[index + 1] = color[1];
      imageData.data[index + 2] = color[2];
      imageData.data[index + 3] = color[3];
    }

    // Loop through the image by blocks to find transparent pixels touching colored pixels
    for (let by = 0; by < height; by += pixelSize) {
      for (let bx = 0; bx < width; bx += pixelSize) {
        let hasColoredNeighbor = false;
        let blockIsTransparent = true;

        // Check all pixels in the current block
        for (let y = by; y < by + pixelSize; y++) {
          for (let x = bx; x < bx + pixelSize; x++) {
            if (x < width && y < height) {
              if (isNonTransparent(x, y)) {
                blockIsTransparent = false;
                break;
              }
            }
          }
          if (!blockIsTransparent) break;
        }

        // If the block is transparent, check neighbors
        if (blockIsTransparent) {
          for (let y = by; y < by + pixelSize; y++) {
            for (let x = bx; x < bx + pixelSize; x++) {
              if (x < width && y < height) {
                if (
                  (x > 0 && isNonTransparent(x - 1, y)) ||
                  (x < width - 1 && isNonTransparent(x + 1, y)) ||
                  (y > 0 && isNonTransparent(x, y - 1)) ||
                  (y < height - 1 && isNonTransparent(x, y + 1))
                ) {
                  hasColoredNeighbor = true;
                }
              }
            }
          }

          // If the block has a colored neighbor, record the modification
          if (hasColoredNeighbor) {
            for (let y = by; y < by + pixelSize; y++) {
              for (let x = bx; x < bx + pixelSize; x++) {
                if (x < width && y < height) {
                  modifications.push([x, y, borderColor]);
                }
              }
            }
          }
        }
      }
    }

    // Apply all modifications at the end
    for (const [x, y, color] of modifications) {
      setPixelColor(x, y, color);
    }

    // Update the canvas
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

<script lang="ts">
  import type { ImageUploadResult } from "$lib/types";
  import { onMount } from "svelte";

  import ColorThief from "colorthief";

  export let src: string;
  export let tolerance = 40;
  export let useFloodFill = false;

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
        function removeBackgroundWithPoints() {
          if (ctx == null) {
            throw Error;
          }
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
        }

        //Colors of the palette
        const colorThief = new ColorThief();
        const palette = colorThief.getPalette(img, 4);
        console.log(palette);

        function generate8BitColorPalette() {
          let palette = [];

          for (let r = 0; r <= 7; r++) {
            for (let g = 0; g <= 7; g++) {
              for (let b = 0; b <= 3; b++) {
                // Convertir r, g, b en vraies valeurs de composantes couleurs
                let realR = r * 36;
                let realG = g * 36;
                let realB = b * 85;
                palette.push([realR, realG, realB]);
              }
            }
          }

          return palette;
        }

        const funkyColorPalette = [
          [255, 0, 0], // Red
          [255, 165, 0], // Orange
          [255, 255, 0], // Yellow
          [0, 128, 0], // Green
          [0, 0, 255], // Blue
          [75, 0, 130], // Indigo
          [238, 130, 238], // Violet
          [255, 20, 147], // Deep Pink
          [255, 69, 0], // Red-Orange
          [255, 215, 0], // Gold
          [50, 205, 50], // Lime Green
          [0, 191, 255], // Deep Sky Blue
          [255, 105, 180], // Hot Pink
          [127, 255, 0], // Chartreuse
          [0, 255, 255], // Cyan / Aqua
          [138, 43, 226], // Blue-Violet
          [255, 0, 255], // Magenta / Fuchsia
          [255, 140, 0], // Dark Orange
          [0, 255, 0], // Lime
          [173, 216, 230], // Light Blue
          [255, 182, 193], // Light Pink
          [30, 144, 255], // Dodger Blue
          [255, 255, 0], // Yellow (another shade)
          [255, 69, 0], // Red-Orange (another shade)
          [0, 255, 127], // Spring Green
          [255, 192, 203], // Pink
          [0, 255, 127], // Spring Green
          [255, 192, 203]
        ];

        const glowyElegantPalette = [
          [255, 215, 0], // Gold
          [255, 160, 122], // Light Salmon
          [255, 99, 71], // Tomato
          [255, 69, 0], // Red-Orange
          [255, 105, 180], // Hot Pink
          [255, 182, 193], // Light Pink
          [255, 192, 203], // Pink
          [255, 140, 0], // Dark Orange
          [255, 69, 0], // Red-Orange (another shade)
          [255, 20, 147], // Deep Pink
          [255, 0, 255], // Magenta / Fuchsia
          [238, 130, 238], // Violet
          [173, 216, 230], // Light Blue
          [127, 255, 212], // Aquamarine
          [0, 255, 255], // Cyan / Aqua
          [30, 144, 255], // Dodger Blue
          [0, 191, 255], // Deep Sky Blue
          [0, 255, 127], // Spring Green
          [50, 205, 50], // Lime Green
          [154, 205, 50], // Yellow Green
          [255, 215, 0], // Gold (another shade)
          [255, 255, 0], // Yellow
          [255, 255, 224], // Light Yellow
          [240, 230, 140], // Khaki
          [255, 250, 205], // Lemon Chiffon
          [255, 228, 181], // Moccasin
          [255, 250, 240], // Floral White
          [255, 255, 255], // White
          [245, 245, 220], // Beige
          [255, 240, 245], // Lavender Blush
          [255, 192, 203], // Pink (another shade)
          [255, 182, 193], // Light Pink (another shade)
          [255, 160, 122], // Light Salmon (another shade)
          [240, 230, 140], // Khaki (another shade)
          [255, 250, 205], // Lemon Chiffon (another shade)
          [255, 228, 181], // Moccasin (another shade)
          [255, 250, 240], // Floral White (another shade)
          [255, 255, 255], // White (another shade)
          [245, 245, 220], // Beige (another shade)
          [255, 240, 245] // Lavender Blush (another shade)
        ];

        const colorfulPixelPalette = [
          [0, 0, 0], // Black
          [255, 255, 255], // White
          [255, 0, 0], // Red
          [0, 255, 0], // Lime
          [0, 0, 255], // Blue
          [255, 255, 0], // Yellow
          [0, 255, 255], // Cyan
          [255, 0, 255], // Magenta
          [255, 165, 0], // Orange
          [128, 0, 128], // Purple
          [255, 192, 203], // Pink
          [255, 20, 147], // Deep Pink
          [255, 105, 180], // Hot Pink
          [255, 140, 0], // Dark Orange
          [255, 69, 0], // Red-Orange
          [255, 0, 255], // Magenta (another shade)
          [238, 130, 238], // Violet
          [173, 216, 230], // Light Blue
          [127, 255, 212], // Aquamarine
          [0, 255, 255], // Cyan (another shade)
          [30, 144, 255], // Dodger Blue
          [0, 191, 255], // Deep Sky Blue
          [0, 255, 127], // Spring Green
          [50, 205, 50], // Lime Green
          [154, 205, 50], // Yellow Green
          [0, 128, 0], // Green
          [128, 128, 0], // Olive
          [128, 0, 0], // Maroon
          [128, 0, 128], // Purple (another shade)
          [165, 42, 42], // Brown
          [210, 105, 30], // Chocolate
          [0, 0, 128], // Navy
          [0, 128, 128], // Teal
          [128, 128, 128], // Gray
          [192, 192, 192], // Silver
          [128, 0, 0], // Maroon (another shade)
          [0, 128, 0], // Green (another shade)
          [128, 128, 0], // Olive (another shade)
          [0, 0, 128] // Navy (another shade)
        ];
        const finalColors = [
          [43, 128, 26], // 2B801A
          [59, 143, 148], // 3B8F94
          [59, 255, 87], // 3BFF57
          [61, 173, 39], // 3DAD27
          [75, 0, 130], // 4B0082
          [83, 201, 207], // 53C9CF
          [123, 0, 214], // 7B00D6
          [125, 249, 255], // 7DF9FF
          [149, 0, 255], // 9500FF
          [255, 0, 0], // FF0000
          [255, 0, 128], // FF0080
          [255, 91, 91], // FF5B5B
          [255, 100, 177], // FF64B1
          [255, 106, 0], // FF6A00
          [255, 141, 59], // FF8D3B
          [255, 158, 207], // FF9ECF
          [255, 175, 118], // FFAF76
          [255, 185, 185], // FFB9B9
          [255, 225, 0], // FFE100
          [255, 233, 68], // FFE944
          [255, 238, 112] // FFEE70
        ];

        const jonatanColors = [
          [0, 112, 174], // 0070AE
          [21, 163, 95], // 15A35F
          [39, 163, 234], // 27A3EA
          [58, 238, 152], // 3AEE98
          [105, 160, 35], // 69A023
          [117, 0, 147], // 750093
          [139, 238, 13], // 8BEE0D
          [151, 2, 29], // 97021D
          [156, 151, 36], // 9C9724
          [191, 244, 218], // BFF4DA
          [196, 136, 19], // C48813
          [200, 245, 143], // C8F58F
          [205, 50, 244], // CD32F4
          [210, 236, 250], // D2ECFA
          [221, 11, 49], // DD0B31
          [239, 229, 0], // EFE500
          [240, 180, 255], // F0B4FF
          [245, 242, 167], // F5F2A7
          [254, 222, 161], // FEDEA1
          [255, 174, 17], // FFAE11
          [255, 185, 198] // FFB9C6
        ];

        const mixedColors = [
          [0, 112, 174], // 0070AE
          [21, 163, 95], // 15A35F
          [39, 163, 234], // 27A3EA
          [58, 238, 152], // 3AEE98
          [103, 0, 147], // 670093
          [103, 184, 0], // 67B800
          [139, 238, 13], // 8BEE0D
          [174, 62, 222], // AE3EDE
          [191, 244, 218], // BFF4DA
          [196, 136, 19], // C48813
          [200, 245, 143], // C8F58F
          [202, 195, 31], // CAC31F
          [210, 236, 250], // D2ECFA
          [239, 229, 0], // EFE500
          [240, 180, 255], // F0B4FF
          [243, 28, 28], // F31C1C
          [245, 242, 167], // F5F2A7
          [251, 89, 89], // FB5959
          [254, 222, 161], // FEDEA1
          [255, 178, 28], // FFB21C
          [255, 185, 198] // FFB9C6
        ];

        //remove the bakcground
        removeBackgroundWithPoints();

        //removing all the disconected pixels
        removeDisconnectedPixels(imageData, ctx);

        //Remove the outside white pixels
        removeBorderConnectedLightPixels(imageData, ctx, 60);

        //removing all the disconected pixels
        removeDisconnectedPixels(imageData, ctx);

        //filling the holes with white (with a limit of contrast)
        fillHolesInImage(imageData, ctx, 100);

        // // Get the new colors
        replaceImageColorsWithPalette(mixedColors, imageData, ctx);

        //Pixelate
        //pixelateImage(imageData, ctx);

        //Adding a black background
        //addBlackBackground(imageData, ctx);

        //add borders in dark blue
        //addBorders(imageData, ctx);

        ctx.putImageData(imageData, 0, 0);
        const transformedImageUrl = canvasElement.toDataURL("image/png");
        // console.log("Image URL after transformation:", transformedImageUrl);

        canvasElement.toBlob(async (blob) => {
          if (doUpload && blob) {
            // console.log("look, a Blob:", blob);
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
        const [cx, cy] = stack.pop() || [];
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
        console.log(avgDifference);
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
    let changesMade = true;

    while (changesMade) {
      changesMade = false; // Réinitialisez à chaque nouveau tour
      const mask = new Uint32Array(imageData.data.length / 4);
      const targetColor = [255, 255, 255]; // Black color

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
            mask[cx + cy * width] = 1;
            imageData.data[index + 3] = 0; // Set alpha to 0, making the pixel transparent
            changesMade = true; // Marquez qu'une modification a été effectuée

            // Check neighbors
            stack.push([cx - 1, cy]);
            stack.push([cx + 1, cy]);
            stack.push([cx, cy - 1]);
            stack.push([cx, cy + 1]);
          }
        }
      }

      // Detect object borders and apply floodFill
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          if (imageData.data[index + 3] === 255) {
            if (
              (x > 0 && imageData.data[(y * width + (x - 1)) * 4 + 3] === 0) ||
              (x < width - 1 &&
                imageData.data[(y * width + (x + 1)) * 4 + 3] === 0) ||
              (y > 0 && imageData.data[((y - 1) * width + x) * 4 + 3] === 0) ||
              (y < height - 1 &&
                imageData.data[((y + 1) * width + x) * 4 + 3] === 0)
            ) {
              floodFill(x, y);
            }
          }
        }
      }
    }

    // Update the canvas
    ctx.putImageData(imageData, 0, 0);
  }

  function pixelateImage(
    originalImageData: ImageData,
    ctx: CanvasRenderingContext2D
  ) {
    const width = originalImageData.width;
    const height = originalImageData.height;
    const pixelSize = 8; // Assuming a similar downscaling as your previous example

    // Create a copy of the image data to avoid modifying it during read operations
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(originalImageData.data);

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        let totalR = 0,
          totalG = 0,
          totalB = 0,
          count = 0;
        let anyTransparent = false;

        // Check pixels inside the block and on its edges from the original image
        for (let py = -1; py <= pixelSize; py++) {
          for (let px = -1; px <= pixelSize; px++) {
            let currentX = x + px;
            let currentY = y + py;

            // Ensure we do not exceed the image boundaries
            if (
              currentX >= 0 &&
              currentX < width &&
              currentY >= 0 &&
              currentY < height
            ) {
              const index = (currentY * width + currentX) * 4;
              const alpha = originalImageData.data[index + 3];
              if (alpha !== 0) {
                // Non-transparent pixel
                totalR += originalImageData.data[index];
                totalG += originalImageData.data[index + 1];
                totalB += originalImageData.data[index + 2];
                count++;
              } else {
                anyTransparent = true;
              }
            }
          }
        }

        // Determine the block's color
        let r, g, b, a;
        if (count === 0) {
          // All pixels are transparent
          r = g = b = a = 0;
        } else if (anyTransparent) {
          // Average the colors of non-transparent pixels
          r = Math.round(totalR / count);
          g = Math.round(totalG / count);
          b = Math.round(totalB / count);
          a = 255; // Non-transparent
        } else {
          // Use the color of the middle pixel
          const midX = x + Math.floor(pixelSize / 2);
          const midY = y + Math.floor(pixelSize / 2);
          const midIndex = (midY * width + midX) * 4;
          r = originalImageData.data[midIndex];
          g = originalImageData.data[midIndex + 1];
          b = originalImageData.data[midIndex + 2];
          a = originalImageData.data[midIndex + 3];
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

    // Update the canvas with the modified image data
    ctx.putImageData(imageData, 0, 0);
  }

  function replaceImageColorsWithPalette(
    palette: number[][],
    imageData: ImageData,
    ctx: CanvasRenderingContext2D
  ) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const pixelColor = [data[i], data[i + 1], data[i + 2]];

      let minDistance = Number.MAX_VALUE;
      let nearestColorIndex = 0;

      for (let j = 0; j < palette.length; j++) {
        const paletteColor = palette[j];
        const distance = colorDistance(pixelColor, paletteColor);

        if (distance < minDistance) {
          minDistance = distance;
          nearestColorIndex = j;
        }
      }

      const nearestColor = palette[nearestColorIndex];
      data[i] = nearestColor[0]; // Red
      data[i + 1] = nearestColor[1]; // Green
      data[i + 2] = nearestColor[2]; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function colorDistance(color1: number[], color2: number[]): number {
    const rDiff = color1[0] - color2[0];
    const gDiff = color1[1] - color2[1];
    const bDiff = color1[2] - color2[2];
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
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

  function addBlackBackground(
    imageData: ImageData,
    ctx: CanvasRenderingContext2D
  ) {
    const targetColor = [255, 255, 255, 255];
    let count = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelTransparency = imageData.data[i + 3];
      if (pixelTransparency == 0) {
        imageData.data[i] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = 255;
        count++;
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

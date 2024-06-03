<script lang="ts">
  import { onMount } from "svelte";

  export let src: string;
  export let tolerance = 10;

  let canvasElement: HTMLCanvasElement;

  onMount(() => {
    const img = new Image();
    img.src = src;
    const ctx = canvasElement.getContext("2d");
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        const { data } = imageData;
        const topLeftColor = ctx.getImageData(0, 0, 1, 1).data;
        console.log({ topLeftColor });
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (
            isWithinTolerance(
              [data[i], data[i + 1], data[i + 2]],
              [topLeftColor[0], topLeftColor[1], topLeftColor[2]],
              tolerance
            )
          ) {
            count++;
            data[i + 3] = 0; // Set alpha to 0, making the pixel transparent.
            // data[i] = 1;
          }
        }
        console.log("altered", count, "pixels");
        ctx.putImageData(imageData, 0, 0);
      }
    };
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

<div>
  <canvas
    bind:this={canvasElement}
    width="1024"
    height="1024"
    class="max-w-full"
  />
</div>

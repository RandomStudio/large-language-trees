<script lang="ts">
  import { onMount } from "svelte";
  import QRCode from "qrcode";

  export let plantId: string;
  export let userId: string;

  let canvasElement: HTMLCanvasElement;

  const generateQRCode = (text: string) => {
    QRCode.toCanvas(canvasElement, text, {
      width: canvasElement.offsetWidth,
      color: {
        dark: "#670093", // roel_blue
        light: "#0000" // roel_green
      }
    });
  };

  onMount(() => {
    let text = `${plantId}&${userId}`;
    generateQRCode(text);
  });
</script>

<canvas
  bind:this={canvasElement}
  style="width:60%; height: auto; aspect-ratio: 1;"
></canvas>

<script lang="ts">
  import { onMount } from "svelte";
  // @ts-ignore
  import QRCode from "qrcode";

  export let text: string = "";
  let canvasElement: HTMLCanvasElement;

  const generateQRCode = (text: string) => {
    QRCode.toCanvas(canvasElement, text, {
      width: canvasElement.offsetWidth,
      color: {
        dark: "#670093", // roel_blue
        light: "#C8F58F" // roel_green
      }
    });
  };

  onMount(() => {
    generateQRCode(text);
  });
</script>

{#if text}
  <div class="flex items-center justify-center">
    <canvas
      bind:this={canvasElement}
      style="width:80%; height: auto; aspect-ratio: 1;"
    ></canvas>
  </div>
{/if}

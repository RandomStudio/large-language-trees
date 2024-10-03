<script lang="ts">
  import { onMount } from "svelte";
  import QRCode from "qrcode";
  import { page } from "$app/stores";

  export let plantId: string;
  export let userId: string;

  let canvasElement: HTMLCanvasElement;

  const generateQRCode = (text: string) => {
    QRCode.toCanvas(canvasElement, text, {
      width: 120,
      color: {
        dark: "#670093", // roel_purple
        light: "#0000" // roel_green
      }
    });
  };

  onMount(() => {
    const domainName = $page.url.origin;
    const text = `${domainName}?params=${plantId}&${userId}`;
    generateQRCode(text);
  });
</script>

<canvas bind:this={canvasElement}></canvas>

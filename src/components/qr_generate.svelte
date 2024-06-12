<script lang="ts">
  import { onMount } from "svelte";
  // @ts-ignore
  import QRCode from "qrcode";

  export let text: string = "";
  let qrCodeUrl = "";

  const generateQRCode = async (text: string) => {
    try {
      qrCodeUrl = await QRCode.toDataURL(text);
    } catch (err) {
      console.error(err);
    }
  };

  onMount(() => {
    generateQRCode(text);
  });
</script>

<!-- Utilisation de la balise img pour afficher le QR code -->
{#if qrCodeUrl}
  <div
    class="content-center relative mix-blend-color-burn scale-75 contrast-200 brightness-150 opacity-75"
  >
    <div
      class="bg-roel_blue absolute inset-0 mix-blend-lighten saturate-200 contrast-200"
      style="z-index: 1;"
    ></div>
    <img src={qrCodeUrl} alt="QR Code" class="size-full" style="z-index: 0;" />
  </div>
{/if}

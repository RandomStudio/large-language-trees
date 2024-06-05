<script>
    import { onMount } from "svelte";
    // @ts-ignore
    import QRCode from "qrcode";

    export let text = "palm";
    let qrCodeUrl = "";
    let canvasId = "canvas_qrCode";

    const generateQRCode = async (text) => {
        try {
            qrCodeUrl = await QRCode.toDataURL(text);
            console.log(qrCodeUrl);
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
    <div class="mt-6">
        <img src={qrCodeUrl} alt="QR Code" class="size-full" />
    </div>
{/if}

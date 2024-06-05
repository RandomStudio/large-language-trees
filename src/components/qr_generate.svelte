<script>
    import { onMount } from "svelte";
    // @ts-ignore
    import QRCode from "qrcode";
    import { canvaWithoutBG } from "$lib/removeBG";

    export let text = "palm";
    let qrCodeUrl = "";
    let canvasId = "canvas_qrCode";

    const generateQRCode = async (text) => {
        try {
            qrCodeUrl = await QRCode.toDataURL(text);
            console.log(qrCodeUrl);

            // Draw the QR code on the canvas and remove the background
            canvaWithoutBG(canvasId, qrCodeUrl);
        } catch (err) {
            console.error(err);
        }
    };

    onMount(() => {
        generateQRCode(text);
    });
</script>

<div>
    <canvas id={canvasId} class="w-64 h-64"></canvas>
</div>

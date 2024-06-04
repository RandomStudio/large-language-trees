<script>
    import { onMount } from "svelte";
    // @ts-ignore
    import QRCode from "qrcode";

    export let text = "palm";
    let qrCodeUrl = "";

    onMount(() => {
        generateQRCode(text);
    });

    // @ts-ignore
    const generateQRCode = async (text) => {
        try {
            qrCodeUrl = await QRCode.toDataURL(text);
        } catch (err) {
            console.error(err);
        }
    };
</script>

<div>
    <h2>Generated QR Code</h2>
    <img class="w-64 h-64" src={qrCodeUrl} alt="QR Code" />
</div>

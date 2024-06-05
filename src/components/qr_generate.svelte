<script lang="ts">
    import { onMount } from "svelte";
    // @ts-ignore
    import QRCode from "qrcode";

    export let text: string = "";
    let qrCodeUrl = "";

    const generateQRCode = async (text: string) => {
        try {
            qrCodeUrl = await QRCode.toDataURL(text);
            console.log(text);
        } catch (err) {
            console.error(err);
        }
    };

    onMount(() => {
        generateQRCode(text);
        console.log(text);
    });
</script>

<!-- Utilisation de la balise img pour afficher le QR code -->
{#if qrCodeUrl}
    <div class="mt-6">
        <img src={qrCodeUrl} alt="QR Code" class="size-full" />
    </div>
{/if}

<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    let showButton = false;

    onMount(() => {
        // Add the overflow-hidden class to the body
        document.body.classList.add("overflow-hidden");

        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        const img = new Image();

        img.onload = () => {
            canvas.width = 350;
            canvas.height = 350;
            const scale = Math.min(
                canvas.width / img.width,
                canvas.height / img.height,
            );
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const xOffset = (canvas.width - scaledWidth) / 2;
            const yOffset = (canvas.height - scaledHeight) / 2;
            context.drawImage(img, xOffset, yOffset, scaledWidth, scaledHeight);
            const topLeftColor = context.getImageData(0, 0, 1, 1).data;
            const tolerance = 25;
            const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
            );
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                if (
                    isWithinTolerance(
                        [data[i], data[i + 1], data[i + 2]],
                        [topLeftColor[0], topLeftColor[1], topLeftColor[2]],
                        tolerance,
                    )
                ) {
                    data[i + 3] = 0;
                }
            }
            context.putImageData(imageData, 0, 0);
            const pngUrl = canvas.toDataURL("image/png");
            document.getElementById("displayImage").src = pngUrl;
        };

        img.src = "/titleimg.png"; // Load the .webp image
    });

    onDestroy(() => {
        // Remove the overflow-hidden class from the body
        document.body.classList.remove("overflow-hidden");
    });

    function isWithinTolerance(pixelColor, targetColor, tolerance) {
        return (
            Math.abs(pixelColor[0] - targetColor[0]) <= tolerance &&
            Math.abs(pixelColor[1] - targetColor[1]) <= tolerance &&
            Math.abs(pixelColor[2] - targetColor[2]) <= tolerance
        );
    }

    function goBack() {
        window.history.back();
    }
</script>

<div
    class="relative flex items-center justify-center min-h-screen bg-roel_green"
>
    <button
        class="fixed top-10 right-10 text-roel_blue text-2xl"
        on:click={goBack}
    >
        ✕
    </button>
    <main class="mx-14 w-full max-w-4xl">
        <div class="flex justify-center">
            <canvas id="canvas" style="display:none;"></canvas>
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img
                id="displayImage"
                alt="Converted Image"
                style="display:block;"
            />
        </div>

        <div class="text-left">
            <p class="text-roel_blue">
                Welcome to the common garden of Lucullus. This Digital Common
                Garden is about connection and cross-pollination.<br /><br />
                Find other Gardeners to start cross-breeding and witness the offspring
                flourish in the common garden of Lucullus.
            </p>
            <br />
            <div class="text-left">
                <span class="text-roel_blue font-semibold">Production:</span><br
                />
                <span class="text-roel_blue">Studio Random</span><br />
                <span class="text-roel_blue font-semibold">Image Data:</span><br
                />
                <span class="text-roel_blue">Chat GPT/ Open AI</span><br /><br
                />
            </div>
        </div>
    </main>
</div>

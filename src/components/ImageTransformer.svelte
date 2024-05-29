<script lang="ts">
    console.log("Hello");

    export function convertWebPToPNG(canvas) {
        return new Promise((resolve, reject) => {
            const context = canvas.getContext("2d");
            if (!context) {
                reject(new Error("Failed to get canvas context"));
                return;
            }
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height,
                );
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                const xOffset = (canvas.width - scaledWidth) / 2;
                const yOffset = (canvas.height - scaledHeight) / 2;
                context.drawImage(
                    img,
                    xOffset,
                    yOffset,
                    scaledWidth,
                    scaledHeight,
                );
                const pngUrl = canvas.toDataURL("image/png");
                resolve(pngUrl);
            };
            img.onerror = () => reject(new Error("Image loading failed"));
            img.src = canvas.getAttribute("data-image-url") || ""; // Assuming the URL is set as a data attribute
        });
    }

    export function removeBackgroundColor(canvas, tolerance) {
        const context = canvas.getContext("2d");
        if (!context) {
            console.error("Failed to get canvas context");
            return;
        }
        const topLeftColor = context.getImageData(0, 0, 1, 1).data;
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
                data[i + 3] = 0; // Make the pixel transparent
            }
        }

        context.putImageData(imageData, 0, 0);
    }

    function isWithinTolerance(pixelColor, targetColor, tolerance) {
        return (
            Math.abs(pixelColor[0] - targetColor[0]) <= tolerance &&
            Math.abs(pixelColor[1] - targetColor[1]) <= tolerance &&
            Math.abs(pixelColor[2] - targetColor[2]) <= tolerance
        );
    }
</script>

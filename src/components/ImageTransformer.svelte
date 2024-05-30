<script lang="ts">
    export function convertWebPToPNG(imageUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d", {
                    willReadFrequently: true,
                });
                if (!context) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                const pngUrl = canvas.toDataURL("image/png");
                resolve(pngUrl);
            };
            img.onerror = () => reject(new Error("Image loading failed"));
            img.src = imageUrl;
        });
    }

    export function removeBackgroundColor(
        pngUrl: string,
        tolerance: number,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d", {
                    willReadFrequently: true,
                });
                if (!context) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
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
                const processedUrl = canvas.toDataURL("image/png");
                resolve(processedUrl);
            };
            img.onerror = () => reject(new Error("Image loading failed"));
            img.src = pngUrl;
        });
    }

    export function transformToBlue(pngUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d", {
                    willReadFrequently: true,
                });
                if (!context) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                const imageData = context.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                );
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] !== 0) {
                        // If the pixel is not transparent
                        data[i] = 0; // Red channel
                        data[i + 1] = 0; // Green channel
                        data[i + 2] = 255; // Blue channel
                    }
                }

                context.putImageData(imageData, 0, 0);
                const blueUrl = canvas.toDataURL("image/png");
                resolve(blueUrl);
            };
            img.onerror = () => reject(new Error("Image loading failed"));
            img.src = pngUrl;
        });
    }

    function isWithinTolerance(
        pixelColor: number[],
        targetColor: number[],
        tolerance: number,
    ): boolean {
        return (
            Math.abs(pixelColor[0] - targetColor[0]) <= tolerance &&
            Math.abs(pixelColor[1] - targetColor[1]) <= tolerance &&
            Math.abs(pixelColor[2] - targetColor[2]) <= tolerance
        );
    }
</script>

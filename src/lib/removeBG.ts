export function canvaWithoutBG(canvaId: string, imageId: string, imgSource: string) {
    const canvas = document.getElementById(canvaId) as HTMLCanvasElement;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const img = new Image();

    img.onload = () => {
        canvas.width = 150;
        canvas.height = 150;
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
        const tolerance = 10;
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
        document.getElementById(imageId).src = pngUrl;
    };

    img.src = imgSource; // Load the .webp image
}

function isWithinTolerance(pixelColor: Array<number>, targetColor: Array<number>, tolerance: number) {
    return (
        Math.abs(pixelColor[0] - targetColor[0]) <= tolerance &&
        Math.abs(pixelColor[1] - targetColor[1]) <= tolerance &&
        Math.abs(pixelColor[2] - targetColor[2]) <= tolerance
    );
}
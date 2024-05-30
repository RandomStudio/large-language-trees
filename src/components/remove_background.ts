// src/lib/imageProcessor.ts
import sharp from 'sharp';
import path from 'path';

export function convertWebPToPNG(inputFilePath: string): string {
    const outputFilePath = path.join(path.dirname(inputFilePath), `${path.basename(inputFilePath, '.webp')}.png`);

    sharp(inputFilePath)
        .toFormat('png')
        .toFile(outputFilePath, (err, info) => {
            if (err) {
                console.error('Error converting image:', err);
            } else {
                console.log(`Image converted successfully and saved as ${outputFilePath}`);
                removeBackgroundColor(outputFilePath, outputFilePath, 10);
            }
        });

    return outputFilePath;
}

function removeBackgroundColor(inputFilePath: string, outputFilePath: string, tolerance: number): void {
    sharp(inputFilePath)
        .raw()
        .ensureAlpha()
        .toBuffer((err, buffer, { width, height, channels }) => {
            if (err) {
                console.error('Error reading image:', err);
                return;
            }

            const totalPixels = width * height;
            const topLeftColor = [buffer[0], buffer[1], buffer[2]];

            for (let i = 0; i < totalPixels; i++) {
                const offset = i * channels;
                if (isWithinTolerance(
                    [buffer[offset], buffer[offset + 1], buffer[offset + 2]],
                    topLeftColor,
                    tolerance
                )) {
                    buffer[offset + 3] = 0; // Make the pixel transparent
                }
            }

            sharp(buffer, { raw: { width, height, channels } })
                .toFile(outputFilePath, (err, info) => {
                    if (err) {
                        console.error('Error saving image:', err);
                    } else {
                        console.log(`Background removed and image saved as ${outputFilePath}`);
                    }
                });
        });
}

function isWithinTolerance(color: number[], reference: number[], tolerance: number): boolean {
    return Math.abs(color[0] - reference[0]) <= tolerance &&
        Math.abs(color[1] - reference[1]) <= tolerance &&
        Math.abs(color[2] - reference[2]) <= tolerance;
}
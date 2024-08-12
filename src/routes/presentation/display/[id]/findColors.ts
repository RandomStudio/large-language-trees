type RGBColor = [number, number, number];

function calculateBrightness([r, g, b]: RGBColor): number {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  function getLuminance([r, g, b]: RGBColor): number {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrast(color1: RGBColor, color2: RGBColor): number {
    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);
    return (
      (Math.max(luminance1, luminance2) + 0.05) /
      (Math.min(luminance1, luminance2) + 0.05)
    );
  }

  function selectRandomPair<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  export function getColors(img:HTMLImageElement){
    const colors = getPaletteFromImage(img,10,10)
    const brightnessThreshold = 130;
    let brightColors: RGBColor[] = [];
    let darkColors: RGBColor[] = [];
    let validPairs: Array<{ bright: RGBColor; dark: RGBColor }> = [];

    colors.forEach((color) => {
      const brightness = calculateBrightness(color);
      if (brightness > brightnessThreshold) {
        brightColors.push(color);
      } else {
        darkColors.push(color);
      }
    });

    brightColors.forEach((bright) => {
      darkColors.forEach((dark) => {
        if (getContrast(bright, dark) >= 4.5) {
          validPairs.push({ bright, dark });
        }
      });
    });

    if (validPairs.length > 0) {
      const randomPair = selectRandomPair(validPairs);
      return {brightColor : `rgb(${randomPair.bright.join(",")})`,
      darkColor : `rgb(${randomPair.dark.join(",")})`}
    }
    else {
        return {brightColor : `rgb(255, 185, 198)`,
        darkColor : `rgb(117, 0, 147)`}
    }
  }

  function getPaletteFromImage(img: HTMLImageElement, colorCount: number, quality: number): [number, number, number][] {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);

    const imageData = context.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;
    const colorMap: Record<string, number> = {};

    for (let i = 0; i < data.length; i += 4 * quality) {
        const alpha = data[i + 3];
        if (alpha > 0) {  // Ignorer les pixels totalement transparents
            const rgbKey = `${data[i]}-${data[i + 1]}-${data[i + 2]}`;
            if (colorMap[rgbKey]) {
                colorMap[rgbKey]++;
            } else {
                colorMap[rgbKey] = 1;
            }
        }
    }

    const sortedColors = Object.keys(colorMap)
        .map(key => ({
            color: key.split('-').map(num => parseInt(num)) as [number, number, number],
            count: colorMap[key]
        }))
        .sort((a, b) => b.count - a.count)
        .map(c => c.color)
        .slice(0, colorCount);

    return sortedColors;
}
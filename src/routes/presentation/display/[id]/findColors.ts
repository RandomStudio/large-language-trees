import ColorThief from "colorthief";


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
    const colorThief = new ColorThief();
    const colors = colorThief.getPalette(img, 10);
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
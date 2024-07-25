<script lang="ts">
  import ColorThief from "colorthief";
  import { onMount } from "svelte";

  export let imageUrl: string;
  export let plantName: string;

  type RGBColor = [number, number, number];

  let brightColor = "rgb(255, 185, 198)";
  let darkColor = "rgb(117, 0, 147)";

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

  onMount(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
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

      // Identifier les paires valides avec un contraste suffisant
      brightColors.forEach((bright) => {
        darkColors.forEach((dark) => {
          if (getContrast(bright, dark) >= 4.5) {
            validPairs.push({ bright, dark });
          }
        });
      });

      // Sélectionner une paire au hasard parmi celles valides
      if (validPairs.length > 0) {
        const randomPair = selectRandomPair(validPairs);
        brightColor = `rgb(${randomPair.bright.join(",")})`;
        darkColor = `rgb(${randomPair.dark.join(",")})`;
      }
    };
  });
</script>

<div class="min-h-screen" style="background-color:{darkColor}">
  <div
    class="w-full h-[250px] flex text-center items-center justify-center text-6xl font-jeanb"
    style="background-color: {darkColor}; color: {brightColor};"
  >
    RESULTING <br /> IN...
  </div>

  <div
    class="fixed inset-x-0 bottom-1/2 w-full h-auto"
    style="fill:{brightColor}"
  >
    <svg
      viewBox="0 0 1000 801"
      xmlns="http://www.w3.org/2000/svg"
      class="rotate-180 mx-auto"
    >
      <path
        d="M0 0H1000V301C1000 577.142 776.142 801 500 801C223.858 801 0 577.142 0 301V0Z"
      />
    </svg>
  </div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img src={imageUrl} alt="Lavender" />
  </div>

  <div
    class="w-full h-[250px] flex text-center items-center justify-center absolute bottom-0 text-6xl font-jeanb z-10"
    style="background-color:{brightColor}; color:{darkColor}"
  >
    THE <br />
    {plantName.toUpperCase()}
  </div>
</div>

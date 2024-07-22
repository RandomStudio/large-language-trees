<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import type { SelectPlant } from "$lib/types";
  import ButtonBottom from "./ButtonBottom.svelte";
  import ReturnButton from "./ReturnButton.svelte";
  import ColorThief from "colorthief";

  export let plantDetails: SelectPlant;
  export let closePopup: () => any;

  let imageUrl: string = plantDetails.imageUrl;
  let backgroundColor = "rgb(156, 163, 175)";
  let circleColor = "rgb(129, 140, 153)";
  let imgWidth = 0;
  let imgHeight = 0;

  function calculateBrightness([r, g, b]) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  function isGreen([r, g, b]) {
    return g > r && g > b && g > 100; // Condition pour identifier une couleur "verte"
  }

  function selectRandomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  onMount(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const colorThief = new ColorThief();
      const colors = colorThief.getPalette(img, 10);
      const brightnessThreshold = 130;
      let brightColors = [];
      let darkColors = [];

      colors.forEach((color) => {
        const brightness = calculateBrightness(color);
        if (!isGreen(color)) {
          // Exclure les couleurs vertes
          if (brightness > brightnessThreshold) {
            brightColors.push(color);
          } else {
            darkColors.push(color);
          }
        }
      });

      if (brightColors.length > 0) {
        backgroundColor = `rgb(${selectRandomColor(brightColors).join(",")})`;
      }
      if (darkColors.length > 0) {
        circleColor = `rgb(${selectRandomColor(darkColors).join(",")})`;
      }
      imgWidth = img.naturalWidth;
      imgHeight = img.naturalHeight;
    };
  });
</script>

<ReturnButton functionReturn={closePopup} />

<div
  style="background-color: {backgroundColor}; position: absolute;"
  class="fixed top-0 left-0 right-0 bottom-0 overflow-auto flex items-center justify-center"
>
  <div
    style="width: {imgWidth / 2}px; height: {imgHeight /
      2}px; background-color: {circleColor}; border-radius: 50%; position: absolute;"
  ></div>
  <img src={imageUrl} alt="plants" style="z-index: 10; position: relative;" />
</div>

<ButtonBottom
  buttonText="Start Pollinating"
  functionClick={() => goto("/gallery/pollination/" + plantDetails.id)}
/>

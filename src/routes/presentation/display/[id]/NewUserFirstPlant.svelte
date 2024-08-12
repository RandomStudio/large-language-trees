<script lang="ts">
  import { onMount } from "svelte";
  import { getColors } from "./findColors";

  export let imageUrl: string;
  export let plantName: string;
  export let gardenerName: string;

  let brightColor = "rgb(255, 185, 198)";
  let darkColor = "rgb(117, 0, 147)";

  let img: HTMLImageElement;

  onMount(() => {
    img.onload = () => {
      const result = getColors(img);
      brightColor = result.brightColor;
      darkColor = result.darkColor;
    };
  });
</script>

<div class="min-h-screen" style:background-color={brightColor}>
  <div
    class="w-full h-[250px] flex text-center items-center justify-center text-6xl font-jeanb"
    style="background-color: {darkColor}; color: {brightColor};"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plantName.toUpperCase()}
  </div>

  <div class=" absolute top-1/2 w-full h-auto" style="fill:{darkColor}">
    <svg viewBox="0 0 1000 801" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 0H1000V301C1000 577.142 776.142 801 500 801C223.858 801 0 577.142 0 301V0Z"
      />
    </svg>
  </div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img
      src={imageUrl}
      alt="Hero view the new user's first plant"
      bind:this={img}
      crossorigin="anonymous"
    />
  </div>

  <div
    class="w-full h-[250px] flex text-center items-center justify-center absolute bottom-0 text-6xl font-jeanb"
    style="background-color={brightColor}; color:{darkColor}"
  >
    JUST SPROUTED <br /> IN THE GARDEN!
  </div>
</div>

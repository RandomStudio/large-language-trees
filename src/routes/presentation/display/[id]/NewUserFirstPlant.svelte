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

<div class="w-screen h-screen" style:background-color={brightColor}>
  <div
    class="w-full h-[15vh] flex text-center items-center justify-center text-8xl font-jeanb"
    style="background-color: {darkColor}; color: {brightColor};"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plantName.toUpperCase()}
  </div>

  <div class="w-screen h-[70vh]">
    <div
      class="w-screen h-[75vw] mt-[25vh] rounded-b-full absolute"
      style="background-color:{darkColor}"
    ></div>
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
    class="w-full h-[15vh] flex text-center items-center justify-center absolute bottom-0 text-8xl font-jeanb"
    style="background-color={brightColor}; color:{darkColor}"
  >
    JUST SPROUTED <br /> IN THE GARDEN!
  </div>
</div>

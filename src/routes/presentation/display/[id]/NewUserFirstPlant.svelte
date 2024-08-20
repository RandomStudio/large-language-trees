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

<div
  class="w-screen h-screen"
  style="background: linear-gradient({darkColor}, {brightColor});"
>
  <div
    class="absolute w-screen h-screen flex text-center items-start justify-center text-9xl py-[2vh] font-gyst"
    style="color: {brightColor};"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plantName.toUpperCase()}
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
    class="absolute w-screen h-screen flex text-center items-end justify-center text-9xl py-[2vh] font-gyst"
    style="color: {darkColor};"
  >
    Just sprouted <br /> in the garden!
  </div>
</div>

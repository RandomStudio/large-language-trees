<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { getColors } from "./findColors";
  import { DateTime } from "luxon";

  export let imageUrl: string;
  export let plantName: string;
  export let gardenerName: string;
  export let created: Date;

  let age = DateTime.now().diff(DateTime.fromJSDate(created));

  let brightColor = "rgb(255, 185, 198)";
  let darkColor = "rgb(117, 0, 147)";

  let img: HTMLImageElement;

  let ticker: NodeJS.Timeout | null = null;

  onMount(() => {
    img.onload = () => {
      const result = getColors(img);
      brightColor = result.brightColor;
      darkColor = result.darkColor;
    };
    ticker = setInterval(() => {
      age = DateTime.now().diff(DateTime.fromJSDate(created));
    }, 1000);
  });

  onDestroy(() => {
    if (ticker) {
      clearInterval(ticker);
    }
  });
</script>

<div class="min-h-screen" style="background-color:{brightColor}">
  <div
    class="w-full h-[250px] flex text-center items-center justify-center text-7xl font-jeanb"
    style="background-color: {darkColor}; color: {brightColor};"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plantName.toUpperCase()}
  </div>

  <div
    class="svg-container"
    style="position: absolute; top: 50vh; height: 26vh; width: 100vw; overflow: hidden;"
  >
    <svg
      viewBox="0 0 1000 801"
      preserveAspectRatio="none"
      style="width: 100%; height: 100%;"
    >
      <path
        d="M0 0H1000V301C1000 577.142 776.142 801 500 801C223.858 801 0 577.142 0 301V0Z"
        fill={darkColor}
      />
    </svg>
  </div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img
      alt="Featured Plant"
      src={imageUrl}
      crossorigin="anonymous"
      bind:this={img}
    />
  </div>

  <div
    class="w-full h-[250px] flex flex-col text-center items-center justify-center absolute bottom-0"
    style="color:{darkColor}"
  >
    <div class="text-4xl font-primer">has been growing for:<br /></div>
    <div class="text-7xl font-jeanb">
      {age.toFormat("hh'H' mm'M' ss'S")}
    </div>
  </div>
</div>

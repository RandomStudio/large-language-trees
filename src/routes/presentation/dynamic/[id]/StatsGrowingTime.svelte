<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { getColors } from "./findColors";
  import { DateTime } from "luxon";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";

  export let applyFilters: boolean = false;
  export let positionStyles: string = "w-full";

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

<div
  class="w-full h-full"
  style="background: linear-gradient({darkColor}, {brightColor});"
>
  <div
    class="w-full h-[19vh] flex text-center items-start py-[3vh] justify-center text-9xl font-gyst"
    style="color: {brightColor};"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plantName.toUpperCase()}
  </div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img
      class="opacity-0"
      alt="Featured Plant"
      src={imageUrl}
      crossorigin="anonymous"
      bind:this={img}
    />
    <div class="absolute w-full h-full flex items-center justify-center">
      <PlantDisplay imageUrl={imageUrl || ""} {applyFilters} {positionStyles} />
    </div>
  </div>

  <div
    class="w-full h-[250px] flex flex-col text-center items-center justify-center absolute bottom-0"
    style="color:{darkColor}"
  >
    <div class="text-5xl font-primer pb-[2vh]">has been growing for:<br /></div>
    <div class="text-9xl font-gyst pb-[2vh]">
      {age.toFormat("hh'H' mm'M' ss'S")}
    </div>
  </div>
</div>

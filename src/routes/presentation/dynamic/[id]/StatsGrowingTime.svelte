<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { getColourPair } from "./findColors";
  import { DateTime } from "luxon";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";

  export let imageUrl: string;
  export let plantName: string;
  export let gardenerName: string;
  export let created: Date;

  let age = DateTime.now().diff(DateTime.fromJSDate(created));

  let brightColor: string | null = null;
  let darkColor: string | null = null;

  let img: HTMLImageElement;

  let ticker: NodeJS.Timeout | null = null;

  onMount(() => {
    img.onload = () => {
      const result = getColourPair(img);
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
  class="fixed top-0 left-0 w-full h-full"
  style="background: linear-gradient({darkColor}, {brightColor});"
>
  <div
    class="w-full h-[19vh] flex text-center items-start py-32 justify-center text-6xl font-gyst"
    style="color: {brightColor};"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plantName.toUpperCase()}
  </div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img
      class="hidden"
      alt="Featured Plant"
      src={imageUrl}
      crossorigin="anonymous"
      bind:this={img}
    />
    <div class="absolute w-full h-full flex items-center justify-center">
      <PlantDisplay imageUrl={imageUrl || ""} applyFilters={false} />
    </div>
  </div>

  <div
    class="w-full h-[250px] flex flex-col text-center items-center justify-center absolute bottom-0"
    style="color:{darkColor}"
  >
    <div class="text-3xl font-primer pb-[2vh]">has been growing for:<br /></div>
    <div class="text-5xl font-gyst pb-[2vh]">
      {age.toFormat("hh'H' mm'M' ss'S")}
    </div>
  </div>
</div>

<SiteUrl />
<SiteUrl position="top" background="green" />

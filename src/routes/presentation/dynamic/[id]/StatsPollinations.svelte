<script lang="ts">
  import { onMount } from "svelte";
  import { getColourPair } from "./findColors";
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import writtenNumber from "written-number";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";

  export let plant: SelectPlant;
  export let pollinationCount: number;
  export let user: PublicUserInfo;

  const gardenerName = user.username;
  const plantName = plant.commonName;
  const imageUrl = plant.imageUrl;

  let brightColor = "rgb(255, 185, 198)";
  let darkColor = "rgb(117, 0, 147)";

  let img: HTMLImageElement;

  onMount(() => {
    img.onload = () => {
      const result = getColourPair(img);
      brightColor = result.brightColor;
      darkColor = result.darkColor;
    };
  });

  let comment = "Show it some love!";
  if (pollinationCount > 10) {
    comment = "...should we be concerned?";
  }
  if (pollinationCount > 7) {
    comment = "What a player!";
  }
  if (pollinationCount > 3) {
    comment = "...impressive!";
  }
  if (pollinationCount > 0) {
    comment = "Great start!";
  }
</script>

<div
  class="fixed top-0 left-0 w-full h-full"
  style="background: linear-gradient({darkColor}, {brightColor});"
>
  <div
    class="w-full h-full text-center text-6xl py-32 font-gyst"
    style="color: {brightColor}"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plantName.toUpperCase()}
  </div>

  <div class="fixed inset-0 flex items-center justify-center pb-[5vh]">
    <img
      class="opacity-0"
      src={imageUrl}
      alt="Hero plant"
      bind:this={img}
      crossorigin="anonymous"
    />
    <div class="absolute w-full h-full flex items-center justify-center">
      <PlantDisplay imageUrl={imageUrl || ""} applyFilters={false} />
    </div>
  </div>

  <div
    class="w-full h-full flex flex-col text-center items-center justify-end absolute bottom-[10vh] text-5xl font-gyst"
    style=" color:{darkColor}"
  >
    Has pollinated <br />
    {writtenNumber(pollinationCount)}
    {pollinationCount === 1 ? "other plant" : "other plants"}...
  </div>

  <div
    class="absolute text-3xl font-primer py-[2vw] px-[2vw] right-[2vh] bottom-[4vh]"
    style="background-color:{darkColor}; color: {brightColor}"
  >
    {comment}
  </div>
</div>

<SiteUrl />
<SiteUrl position="top" background="yelllow" />

<script lang="ts">
  import { onMount } from "svelte";
  import { getColors } from "./findColors";
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import writtenNumber from "written-number";

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
      const result = getColors(img);
      brightColor = result.brightColor;
      darkColor = result.darkColor;
    };
  });

  let comment = "Show it some love!";
  if (pollinationCount > 30) {
    comment = "...should we be concerned!";
  }
  if (pollinationCount > 20) {
    comment = "What a player!";
  }
  if (pollinationCount > 10) {
    comment = "...impressive!";
  }
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
      alt="Lavender"
      bind:this={img}
      crossorigin="anonymous"
    />
  </div>

  <div
    class="w-full h-[200px] flex text-center items-center justify-center absolute bottom-[200px] text-6xl font-jeanb"
    style=" color:{darkColor}"
  >
    HAS POLLINATED <br />
    {writtenNumber(pollinationCount)}
    {pollinationCount >= 2 ? "OTHER PLANTS" : "OTHER PLANT"}...
  </div>

  <div
    class=" flex justify-end items-center absolute text-3xl font-primer px-2 py-0.5 right-[30px] bottom-[30px]"
    style="background-color:{darkColor}; color: {brightColor}"
  >
    {comment}
  </div>
</div>

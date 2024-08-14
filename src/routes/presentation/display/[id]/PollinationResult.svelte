<script lang="ts">
  import { onMount } from "svelte";
  import { getColors } from "./findColors";
  import type { InsertPlant, PublicUserInfo, SelectPlant } from "$lib/types";

  export let plantTop: SelectPlant;
  export let plantBottom: SelectPlant;
  export let authorTop: PublicUserInfo;
  export let authorBottom: PublicUserInfo;
  export let newPlant: InsertPlant;

  let plantNameTop = plantTop.commonName;
  let plantNameBottom = plantBottom.commonName;

  let plantImageUrlTop = plantTop.imageUrl;
  let plantImageUrlBottom = plantBottom.imageUrl;

  let authorNameTop = authorTop.username;
  let authorNameBottom = authorBottom.username;

  let newPlantimageUrl = newPlant.imageUrl;
  let newPlantName = newPlant.commonName;

  let imgTop: HTMLImageElement;
  let imgBottom: HTMLImageElement;
  let imgNew: HTMLImageElement;

  let brightColorNew = "rgb(255, 185, 198)";
  let darkColorNew = "rgb(117, 0, 147)";
  let brightColorTop = "rgb(255, 185, 198)";
  let darkColorTop = "rgb(117, 0, 147)";
  let brightColorBottom = "rgb(255, 185, 198)";
  let darkColorBottom = "rgb(117, 0, 147)";

  let status = "PollinationEvent";

  onMount(() => {
    imgTop.onload = () => {
      const resultTop = getColors(imgTop);
      brightColorTop = resultTop.brightColor;
      darkColorTop = resultTop.darkColor;
    };

    imgBottom.onload = () => {
      const resultBottom = getColors(imgBottom);
      brightColorBottom = resultBottom.brightColor;
      darkColorBottom = resultBottom.darkColor;
    };

    imgNew.onload = () => {
      const resultNew = getColors(imgNew);
      brightColorNew = resultNew.brightColor;
      darkColorNew = resultNew.darkColor;
    };

    setTimeout(() => {
      status = "PollinationResult";
    }, 3000);
  });
</script>

<div
  class="min-h-screen"
  style="background-color:{darkColorNew}; display:{status ===
  'PollinationResult'
    ? 'block'
    : 'none'}"
>
  <div
    class="w-full h-[250px] flex text-center items-center justify-center text-7xl font-jeanb"
    style="background-color: {darkColorNew}; color: {brightColorNew};"
  >
    RESULTING <br /> IN...
  </div>

  <div
    class="fixed inset-x-0 bottom-1/2 w-full h-auto"
    style="fill:{brightColorNew}"
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
    <img
      src={newPlantimageUrl}
      alt="Resulting plant, hero view"
      bind:this={imgNew}
      crossorigin="anonymous"
    />
  </div>

  <div
    class="w-full h-[250px] flex text-center items-center justify-center absolute bottom-0 text-7xl font-jeanb z-10"
    style="background-color:{brightColorNew}; color:{darkColorNew}"
  >
    THE <br />
    {newPlantName.toUpperCase()}
  </div>
</div>

<div
  class="min-h-screen"
  style="display:{status === 'PollinationResult' ? 'none' : 'block'}"
>
  <div
    class="w-full h-[250px] flex text-center items-center justify-center text-7xl font-jeanb"
    style="background-color: {darkColorTop}; color: {brightColorTop};"
  >
    {authorNameTop.toUpperCase()}'S <br />
    {plantNameTop.toUpperCase()}
  </div>

  <div
    class="h-[560px] flex flex-col justify-end items-center relative"
    style="background-color:{brightColorTop}"
  >
    <svg
      width="400"
      height="400"
      class="rotate-180 translate-y-[200px]"
      style="fill:{darkColorTop}"
    >
      <path d="M0,200 a1,1 0 0,0 400,0" />
    </svg>

    <div
      class="absolute inset-0 flex items-center justify-center translate-y-[70px]"
    >
      <img
        src={plantImageUrlTop}
        alt="Lavender"
        class="w-[400px]"
        bind:this={imgTop}
        crossorigin="anonymous"
      />
    </div>
  </div>

  <div class="fixed inset-0 flex items-center justify-center z-20">
    <div
      class="py-1 px-6 z-50 font-primerb text-3xl"
      style="background-color: {brightColorTop}; color: {darkColorBottom};"
    >
      is pollinating with
    </div>
  </div>

  <div
    class="h-[560px] flex flex-col justify-end items-center relative"
    style="background-color:{darkColorBottom}"
  >
    <svg
      width="400"
      height="400"
      class="translate-y-[-361px]"
      style="fill:{brightColorBottom}"
    >
      <path d="M0,200 a1,1 0 0,0 400,0" />
    </svg>
    <div
      class="absolute inset-0 flex items-center justify-center translate-y-[-70px]"
    >
      <img
        src={plantImageUrlBottom}
        alt="Lavender"
        class="w-[400px] rotate-180"
        bind:this={imgBottom}
        crossorigin="anonymous"
      />
    </div>
  </div>

  <div
    class="w-full h-[250px] flex text-center items-center justify-center bottom-[0px] text-7xl font-jeanb z-10"
    style="background-color: {brightColorBottom}; color: {darkColorBottom};"
  >
    {authorNameBottom.toUpperCase()}'S <br />
    {plantNameBottom.toUpperCase()}
  </div>
</div>

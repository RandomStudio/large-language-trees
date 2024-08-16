<script lang="ts">
  import { onMount } from "svelte";
  import { getColors } from "./findColors";
  import type { InsertPlant, PublicUserInfo, SelectPlant } from "$lib/types";
  import { POLLINATION_EVENT_TIMEOUT } from "$lib/constants";

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
    }, POLLINATION_EVENT_TIMEOUT);
  });
</script>

<div
  class="w-screen h-screen"
  style="background-color:{darkColorNew}; display:{status ===
  'PollinationResult'
    ? 'block'
    : 'none'}"
>
  <div
    class="w-full h-[15vh] flex text-center items-center justify-center text-8xl font-jeanb"
    style="background-color: {darkColorNew}; color: {brightColorNew};"
  >
    RESULTING <br /> IN...
  </div>

  <div
    class="w-screen h-[75vw] rounded-t-full absolute"
    style="background-color:{brightColorNew}"
  ></div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img
      src={newPlantimageUrl}
      alt="Resulting plant, hero view"
      bind:this={imgNew}
      crossorigin="anonymous"
    />
  </div>

  <div
    class="w-full h-[15vh] flex text-center items-center justify-center absolute bottom-0 text-8xl font-jeanb z-10"
    style="background-color:{brightColorNew}; color:{darkColorNew}"
  >
    THE <br />
    {newPlantName.toUpperCase()}
  </div>
</div>

<!-- ▲ RESULT ▲  //  ▼ EVENT ▼ -->

<div
  class="w-screen h-screen"
  style="display:{status === 'PollinationResult' ? 'none' : 'block'}"
>
  <div
    class="w-screen h-[15vh] flex text-center items-center justify-center text-8xl font-jeanb"
    style="background-color: {darkColorTop}; color: {brightColorTop};"
  >
    {authorNameTop.toUpperCase()}'S <br />
    {plantNameTop.toUpperCase()}
  </div>

  <div
    class="h-[35vh] flex flex-col justify-end items-center relative"
    style="background-color:{brightColorTop}"
  >
    <div
      class="w-[90vw] h-[45vw] rounded-t-full absolute"
      style="background-color:{darkColorTop}"
    ></div>

    <div
      class="absolute inset-0 flex items-center justify-center translate-y-[1vh]"
    >
      <img
        src={plantImageUrlTop}
        alt="Lavender"
        class="w-[35vh]"
        bind:this={imgTop}
        crossorigin="anonymous"
      />
    </div>
  </div>

  <div class="fixed inset-0 flex items-center justify-center z-20">
    <div
      class="py-1 px-6 z-50 font-primerb text-6xl"
      style="background-color: {brightColorTop}; color: {darkColorBottom};"
    >
      is pollinating with
    </div>
  </div>

  <div
    class="h-[35vh] flex flex-col justify-end items-center relative top-0"
    style="background-color:{darkColorBottom}"
  >
    <div
      class="w-[90vw] h-[45vw] rounded-b-full absolute top-0"
      style="background-color:{brightColorBottom}"
    ></div>
    <div
      class="absolute inset-0 flex items-center justify-center translate-y-[-1vh]"
    >
      <img
        src={plantImageUrlBottom}
        alt="Lavender"
        class="w-[35vh] rotate-180"
        bind:this={imgBottom}
        crossorigin="anonymous"
      />
    </div>
  </div>

  <div
    class="w-full h-[15vh] flex text-center items-center justify-center bottom-[0px] text-8xl font-jeanb z-10"
    style="background-color: {brightColorBottom}; color: {darkColorBottom};"
  >
    {authorNameBottom.toUpperCase()}'S <br />
    {plantNameBottom.toUpperCase()}
  </div>
</div>

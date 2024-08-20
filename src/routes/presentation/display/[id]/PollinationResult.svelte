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
  style="background: linear-gradient({brightColorNew}, {darkColorNew}); display:{status ===
  'PollinationResult'
    ? 'block'
    : 'none'}"
>
  <div
    class="absolute w-screen h-screen text-center text-9xl font-gyst py-[2vh]"
    style="color: {darkColorNew};"
  >
    Resulting <br /> in...
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
    class="absolute w-screen h-screen flex text-center items-end justify-center text-9xl py-[2vh] font-gyst"
    style="color:{brightColorNew}"
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
  <div class="fixed inset-0 flex items-center justify-center z-20">
    <div
      class="py-[1vh] px-[2vh] z-50 font-primer text-5xl"
      style="background-color: {brightColorTop}; color: {darkColorBottom};"
    >
      is pollinating with
    </div>
  </div>
  <div
    class="w-screen h-[50vh] text-9xl font-gyst text-center items-center py-[2vh] flex flex-col justify-start"
    style="background: linear-gradient({brightColorTop}, {darkColorTop}); color: {darkColorTop};"
  >
    {authorNameTop.toUpperCase()}'S <br />
    {plantNameTop.toUpperCase()}
    <div class="absolute w-[38vh] bottom-[48vh]">
      <img
        src={plantImageUrlTop}
        alt="TopImage"
        bind:this={imgTop}
        crossorigin="anonymous"
      />
    </div>
  </div>
  <div
    class="w-screen h-[50vh] text-9xl font-gyst text-center items-center py-[2vh] flex flex-col justify-end"
    style="background: linear-gradient({brightColorBottom}, {darkColorBottom}); color: {brightColorBottom};"
  >
    {authorNameBottom.toUpperCase()}'S <br />
    {plantNameBottom.toUpperCase()}
    <div class="absolute w-[38vh] top-[48vh] rotate-180">
      <img
        src={plantImageUrlBottom}
        alt="BottomImage"
        bind:this={imgBottom}
        crossorigin="anonymous"
      />
    </div>
  </div>

  <div
    class="w-screen h-[50vh] flex text-center items-center justify-center text-8xl font-jeanb"
    style="background: linear-gradient({darkColorTop}, {brightColorTop}); color: {brightColorTop};"
  >
    {authorNameTop.toUpperCase()}'S <br />
    {plantNameTop.toUpperCase()}
  </div>

  <div
    class="h-[35vh] flex flex-col justify-end items-center relative"
    style="background-color:{brightColorTop}"
  >
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

  <div
    class="h-[35vh] flex flex-col justify-end items-center relative top-0"
    style="background-color:{darkColorBottom}"
  >
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

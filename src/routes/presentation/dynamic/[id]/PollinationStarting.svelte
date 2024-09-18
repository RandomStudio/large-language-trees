<script lang="ts">
  import type { PublicUserInfo, SelectPlant } from "$lib/types";

  export let authorTop: PublicUserInfo;
  export let authorBottom: PublicUserInfo;
  export let plantTop: SelectPlant;
  export let plantBottom: SelectPlant;
</script>

<div class="w-screen h-screen items-center justify-center standard-gradient">
  <div>test</div>
  <!-- <div
    class="w-screen h-screen text-center text-roel_yellow text-7xl font-gyst absolute top-32 z-10"
  >
    {authorTop.username}'s<br />
    {plantTop.commonName}
  </div>

  <div
    class="bg-roel_green w-screen flex flex-col justify-end items-center relative"
  >
    <svg
      width="400"
      height="400"
      class="rotate-180 translate-y-[200px] fill-roel_red"
    >
      <path d="M0,200 a1,1 0 0,0 400,0" />
    </svg>
    <div
      class="absolute inset-0 flex items-center justify-center translate-y-[70px]"
    >
      {#if plantTop.imageUrl}
        <img
          src={plantTop.imageUrl}
          alt="Pollinating Plant First Parent"
          class="w-[400px]"
          crossorigin="anonymous"
        />
      {/if}
    </div>
  </div>

  <div class="absolute inset-0 flex items-center justify-center">
    <div
      class="bg-roel_green text-new_purple py-1 px-6 z-50 font-gyst text-3xl"
    >
      is pollinating with
    </div>
  </div>

  <div
    class="bg-new_purple w-screen flex flex-col justify-end items-center relative"
  >
    <svg width="400" height="400" class="translate-y-[-361px] fill-roel_rose">
      <path d="M0,200 a1,1 0 0,0 400,0" />
    </svg>
    <div
      class="absolute inset-0 flex items-center justify-center translate-y-[-70px]"
    >
      {#if plantBottom.imageUrl}
        <img
          src={plantBottom.imageUrl}
          alt="Pollinating Plant Second Parent"
          class="w-[400px] rotate-180"
          crossorigin="anonymous"
        />
      {/if}
    </div>
  </div>

  <div
    class="w-screen h-screen text-center text-roel_yellow text-7xl font-gyst absolute bottom-32 z-10"
  >
    {authorBottom.username}'s<br />
    {plantBottom.commonName}
  </div> -->
</div>

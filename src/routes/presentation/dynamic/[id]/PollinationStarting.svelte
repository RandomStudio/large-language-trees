<script lang="ts">
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";

  export let authorTop: PublicUserInfo;
  export let authorBottom: PublicUserInfo;
  export let plantTop: SelectPlant;
  export let plantBottom: SelectPlant;
</script>

<div class="w-full h-full items-center justify-center standard-gradient">
  <div
    class="w-full text-center text-roel_yellow text-7xl font-gyst absolute top-32 z-10 uppercase"
  >
    {authorTop.username}'s<br />
    {plantTop.commonName}
  </div>

  <div
    class="grid grid-cols-1 gap-1 place-content-center place-items-center h-screen w-full"
  >
    {#if plantTop.imageUrl}
      <img
        src={plantTop.imageUrl}
        alt="Pollinating Plant First Parent"
        class="w-[90]"
        crossorigin="anonymous"
      />
    {/if}

    {#if plantBottom.imageUrl}
      <img
        src={plantBottom.imageUrl}
        alt="Pollinating Plant First Parent"
        class="w-[90] rotate-180"
        crossorigin="anonymous"
      />
    {/if}
  </div>

  <div class="absolute inset-0 flex items-center justify-center">
    <div
      class="text-center text-roel_yellow font-gyst text-7xl uppercase z-10 leading-[4rem]"
    >
      <div>is</div>
      <div>pollinating</div>
      <div>with</div>
    </div>
  </div>

  <div
    class="w-full text-center text-new_purple text-7xl font-gyst absolute bottom-32 z-10 uppercase"
  >
    {authorBottom.username}'s<br />
    {plantBottom.commonName}
  </div>
</div>

<SiteUrl />
<SiteUrl position="top" background="yelllow" />

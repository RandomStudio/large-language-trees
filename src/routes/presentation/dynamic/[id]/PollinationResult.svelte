<script lang="ts">
  import { onMount } from "svelte";
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import { getColourPair } from "./findColors";
  import SiteUrl from "../../shared-components/SiteUrl.svelte";

  export let authorTop: PublicUserInfo;
  export let authorBottom: PublicUserInfo;
  export let newPlant: SelectPlant;

  let brightColor: string | null = null;
  let darkColor: string | null = null;

  let img: HTMLImageElement;

  onMount(() => {
    img.onload = () => {
      const result = getColourPair(img);
      darkColor = result.darkColor;
      brightColor = result.brightColor;
    };
  });
</script>

<img
  class="hidden"
  alt="Featured Plant"
  src={newPlant.imageUrl}
  crossorigin="anonymous"
  bind:this={img}
/>

<div
  class="w-full h-full items-center justify-center"
  style="background: linear-gradient({darkColor}, {brightColor});"
>
  <div
    class="w-full text-center text-7xl font-gyst absolute top-32 z-10 uppercase"
    style:color={brightColor}
  >
    <div>
      {authorTop.username}
    </div>
    <div>&</div>
    <div>
      {authorBottom.username}
    </div>
  </div>

  <div
    class="grid grid-cols-1 gap-1 place-content-center place-items-center h-screen w-full"
  >
    <PlantDisplay imageUrl={newPlant.imageUrl || ""} applyFilters={false} />
  </div>

  <div
    class="w-full text-center text-7xl font-gyst absolute bottom-32 z-10 uppercase"
    style:color={darkColor}
  >
    Gave life to<br />
    {newPlant.commonName}
  </div>
</div>

<SiteUrl />
<SiteUrl position="top" background="yelllow" />

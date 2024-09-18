<script lang="ts">
  import { onMount } from "svelte";
  import { getColors } from "./findColors";
  import type { InsertPlant, PublicUserInfo, SelectPlant } from "$lib/types";
  import { POLLINATION_START_TIMEOUT } from "$lib/constants";
  import { fade } from "svelte/transition";
  import { FADE_DURATION } from "$lib/constants";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";

  export let authorTop: PublicUserInfo;
  export let authorBottom: PublicUserInfo;
  export let newPlant: InsertPlant;

  let brightColorNew = "rgb(255, 185, 198)";
  let darkColorNew = "rgb(117, 0, 147)";
  let brightColorTop = "rgb(255, 185, 198)";
  let darkColorTop = "rgb(117, 0, 147)";
  let brightColorBottom = "rgb(255, 185, 198)";
  let darkColorBottom = "rgb(117, 0, 147)";

  const soundFiles = [
    "/Sound 1 - Schuup.mp3",
    "/Sound 2 - Dududu.mp3",
    "/Sound 3 - Whistles.mp3",
    "/Sound 4 - Schuup2.mp3",
    "/Sound 5 - Dududu2.mp3",
    "/Sound 6 - Ghost.mp3"
  ];

  function getRandomSoundFile() {
    const randomIndex = Math.floor(Math.random() * soundFiles.length);
    return soundFiles[randomIndex];
  }

  onMount(() => {
    const audio = new Audio(getRandomSoundFile());
    audio.play();
  });
</script>

<div class="fixed inset-0 flex items-center justify-center">
  <div class="absolute w-screen h-screen flex items-center justify-center">
    {authorTop}<br />
    &
    {authorBottom}
    <PlantDisplay imageUrl={newPlant.imageUrl || ""} applyFilters={false} />
    gave life to:<br />
    {newPlant.commonName}
  </div>
</div>

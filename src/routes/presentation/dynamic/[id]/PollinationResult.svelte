<script lang="ts">
  import { onMount } from "svelte";
  import type { InsertPlant, PublicUserInfo, SelectPlant } from "$lib/types";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";

  export let authorTop: PublicUserInfo;
  export let authorBottom: PublicUserInfo;
  export let newPlant: SelectPlant;

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
    // audio.play();
  });
</script>

<div class="w-full h-full items-center justify-center standard-gradient">
  <div
    class="w-full text-center text-roel_yellow text-7xl font-gyst absolute top-32 z-10 uppercase"
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
    class="w-full text-center text-new_purple text-7xl font-gyst absolute bottom-32 z-10 uppercase"
  >
    Gave life to<br />
    {newPlant.commonName}
  </div>
</div>

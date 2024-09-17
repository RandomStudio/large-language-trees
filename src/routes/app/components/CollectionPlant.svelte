<script lang="ts">
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import type { CandidatePlant, SelectPlant, SelectUser } from "$lib/types";

  export let authorTopUser: SelectUser | undefined;
  export let authorBottomUser: SelectUser | undefined;
  export let disableAnimation = true;
  export let plant: SelectPlant | CandidatePlant;

  export let onClick: (plant: SelectPlant | CandidatePlant) => void;

  export let isPending = false;
  export let isReadyToSprout = false;
  let isReady = !isPending && !isReadyToSprout;

  function getName(plant: SelectPlant | CandidatePlant) {
    if ("givenName" in plant) {
      return plant.givenName;
    } else if ("commonName" in plant) {
      return plant.commonName;
    } else {
      return "No name?";
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="border-roel_purple text-roel_purple border-2 rounded-[25px] flex flex-col items-center justify-center p-2 mb-8"
  on:click={() => onClick(plant)}
>
  {#if authorTopUser && authorBottomUser}
    <p class="text-roel_purple font-normal text-center">
      {authorTopUser.username} ❤️ {authorBottomUser.username}
    </p>
  {/if}
  <div class="{isPending && 'animate-pulse'} text-center">
    <PlantDisplay
      {disableAnimation}
      imageClass="h-[161px] w-[161px] object-cover"
      imageUrl={plant.imageUrl ?? "/pollination/Seed_01.png"}
      applyFilters={false}
    />

    {#if isPending}
      <div class="text-xs">{getName(plant)}</div>
      <div class="text-small mb-2">Digging up plants...</div>
    {/if}

    {#if isReadyToSprout}
      <div class="text-xs">Click to sprout</div>
      <div class="text-xs">{getName(plant)}</div>
      <div class="text-xs">now</div>
    {/if}

    {#if isReady}
      <div class="text-xs mb-2">{getName(plant)}</div>
    {/if}
  </div>
</div>

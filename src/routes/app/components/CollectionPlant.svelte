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
  class="border-new_purple text-new_purple border-2 rounded-[25px] flex flex-col items-center justify-center p-2 mb-8"
  on:click={() => onClick(plant)}
>
  {#if authorTopUser && authorBottomUser}
    <p class="text-new_purple font-normal text-center">
      {authorTopUser.username} ♡ {authorBottomUser.username}
    </p>
  {/if}
  <div
    class="{isPending && 'animate-pulse'} {isReadyToSprout &&
      'shakingAnimation'} text-center"
  >
    <PlantDisplay
      {disableAnimation}
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

<style scoped>
  .shakingAnimation :global(img) {
    animation: shake 1s infinite;
    animation-play-state: running;
  }

  @keyframes shake {
    0% {
      transform: translate(0, 0);
    }
    10% {
      transform: translate(-3px, -2px) rotate(-2deg);
    }
    20% {
      transform: translate(4px, 2px) rotate(2deg);
    }
    30% {
      transform: translate(-5px, 0px) rotate(-3deg);
    }
    40% {
      transform: translate(5px, 3px) rotate(3deg);
    }
    50% {
      transform: translate(-4px, -1px) rotate(-2deg);
    }
    60% {
      transform: translate(3px, 1px) rotate(2deg);
    }
    70% {
      transform: translate(-2px, 2px) rotate(-1deg);
    }
    80% {
      transform: translate(2px, -3px) rotate(1deg);
    }
    90% {
      transform: translate(-1px, 1px) rotate(0deg);
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
  }
</style>

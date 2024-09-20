<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { LOADING_MESSAGES } from "$lib/constants";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import type { CandidatePlant, SelectPlant, SelectUser } from "$lib/types";
  import { onMount } from "svelte";

  export let authorTopUser: SelectUser | undefined;
  export let authorBottomUser: SelectUser | undefined;
  export let disableAnimation = true;
  export let plant: SelectPlant | CandidatePlant;

  export let onClick: (plant: SelectPlant | CandidatePlant) => void;

  export let isPending = false;
  export let isReadyToSprout = false;
  export let hasError: null | string = null;

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

  let currentMessage = LOADING_MESSAGES[0];
  let animationEl: HTMLDivElement;

  const removeCandidatePlant = async () => {
    const p = plant as CandidatePlant;
    console.log("Trying to remove candidate plant", p.plantId, "...");
    const res = await fetch(`/api/plants/${p.plantId}/generatedPlant`, {
      method: "DELETE"
    });
    if (res.status === 202) {
      console.log("ok");
      invalidateAll();
    } else {
      console.error(res.status, res.statusText);
    }
  };

  onMount(() => {
    console.log({ hasError });
    let i = 0;
    let timer: number;
    const pause = (duration: number) =>
      new Promise((resolve) => setTimeout(resolve, duration));

    if (!isPending) {
      return;
    }
    const changeMessage = async () => {
      timer = window.setTimeout(async () => {
        i = (i + 1) % LOADING_MESSAGES.length;
        animationEl.classList.add("isAnimating");
        await pause(500);
        currentMessage = LOADING_MESSAGES[i];
        animationEl.classList.remove("isAnimating");
        await pause(500);
        requestAnimationFrame(changeMessage);
      }, 2000);
    };

    changeMessage();
    return () => clearTimeout(timer);
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="border-new_purple border-2 rounded-[25px] flex flex-col items-center justify-center p-2 mb-8"
  on:click={() => onClick(plant)}
>
  {#if authorTopUser && authorBottomUser}
    <p class="font-normal text-center capitalize">
      {authorTopUser.username} ♡ {authorBottomUser.username}
    </p>
  {/if}
  <div
    class="animationContainer {isReadyToSprout &&
      'shakingAnimation'} text-center"
    bind:this={animationEl}
  >
    <PlantDisplay
      {disableAnimation}
      imageUrl={isReadyToSprout
        ? "/pollination/Seed_01.png"
        : (plant.imageUrl ?? "/pollination/Seed_01.png")}
      applyFilters={false}
    />

    {#if hasError}
      <div class="text-md text-red-600">
        ERROR: {hasError}
      </div>
      <button
        on:click={removeCandidatePlant}
        class="bg-red-500 text-roel_green font-primer text-sm px-4 py-[0.5rem] mb-5 border-2 border-roel_blue rounded-full button-with-active"
      >
        Click to remove and retry
      </button>
    {/if}

    {#if isPending && !hasError}
      <div class="text-xs">{getName(plant)}</div>
      <div class="text-small mb-2 rotator">
        {currentMessage}
      </div>
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

  .animationContainer {
    opacity: 1;
    transition: opacity 0.5s ease-out;
  }
  .animationContainer.isAnimating {
    opacity: 0.5;
  }
  .rotator {
    transition: opacity 0.5s ease-out;
  }
  .animationContainer.isAnimating .rotator {
    opacity: 0;
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

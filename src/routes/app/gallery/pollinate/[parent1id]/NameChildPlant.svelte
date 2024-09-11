<script lang="ts">
  import { LIMIT_CHARACTERS_PLANTNAME } from "$lib/constants";
  import ButtonBottom from "$lib/shared-components/ButtonBottom.svelte";
  import { pickRandomElement } from "random-elements";
  import { onMount } from "svelte";

  export let otherUserName: string;
  export let initNewName: string;
  export let onNameChosen: (name: string) => void;

  let seedImage: string | null = null;
  let newName: string = initNewName;

  onMount(() => {
    seedImage = pickRandomElement([
      "Seed_01.png",
      "Seed_02.png",
      "Seed_03.png",
      "Seed_04.png",
      "Seed_05.png",
      "Seed_06.png"
    ]);
  });
</script>

<div
  class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green z-40 standard-gradient"
>
  <div class="overflow-y-auto pb-20" style="max-height: calc(100%);">
    <h1 class="font-gyst text-3xl pl-8 pt-8">Hooray!</h1>
    <div class="mx-12 font-primer text-roel_blue text-left mt-5">
      <p class="text-2xl">
        You and {otherUserName} gave life to a new seed together.
      </p>
      <p class="text-2xl">What will be the name of your sprout?</p>
    </div>
    <div class="flex items-center justify-center">
      {#if seedImage}
        <img
          class="w-1/2"
          src={`/pollination/${seedImage}`}
          alt="Random seed"
        />
      {/if}
    </div>
    <video
      class="absolute top-0 w-screen placeholder:pointer-events-none"
      src="/pollination/seedbirth.webm"
      loop={true}
      autoplay={true}
      muted={true}
    />

    <form on:submit|preventDefault={() => onNameChosen(newName)} class="mt-2">
      <div class="flex items-center justify-center">
        <input
          class="bg-roel_blue bg-opacity-10 border-[3px] px-4 py-2 border-roel_blue rounded-full font-primer text-roel_blue text-2xl w-11/12 max-w-xs placeholder-dark_grey placeholder:font-inter text-center z-10"
          type="text w-screen"
          maxlength={LIMIT_CHARACTERS_PLANTNAME}
          value={newName}
        />
      </div>
      <ButtonBottom
        text={"Let it grow!"}
        onClick={() => onNameChosen(newName)}
      />
    </form>
  </div>
</div>

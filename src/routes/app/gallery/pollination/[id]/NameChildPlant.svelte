<script lang="ts">
  import { pickRandomElement } from "random-elements";
  import { onMount } from "svelte";

  export let otherUserName: string;

  let seedImage: string | null = null;

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
        You and {otherUserName} gave like to a new sprout together.
      </p>
      <p class="text-2xl">What is the name of its seed?</p>
    </div>
    {#if seedImage}
      <div class="flex items-center justify-center">
        <img class="w-1/2" src={`/pollination/${seedImage}`} />
      </div>
    {/if}
    <video
      class="absolute top-0 w-screen"
      src="/pollination/seedbirth.webm"
      loop={true}
      autoplay={true}
      muted={true}
    />
  </div>
</div>

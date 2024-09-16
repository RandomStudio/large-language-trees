<script lang="ts">
  import { LIMIT_CHARACTERS_PLANTNAME } from "$lib/constants";
  import ButtonBottom from "$lib/shared-components/ButtonBottom.svelte";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";
  import type { PublicUserInfo } from "$lib/types";
  import { pickRandomElement } from "random-elements";
  import { onMount } from "svelte";
  import Layout from "../../../components/Layout.svelte";

  export let thisUser: PublicUserInfo;
  export let otherUser: PublicUserInfo;
  export let onNameChosen: (name: string) => void;
  export let onCancel: () => any;

  let seedImage: string | null = null;
  let newName: string = `${thisUser.username}x${otherUser.username}Plant`;

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

<Layout title="Hooray!">
  <div class="mb-[200px]">
    <div class="text-medium text-roel_green">
      You and {otherUser.username} gave life to a new seed together.
    </div>
    <div class="relative">
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
        class="absolute top-0 w-screen pointer-events-none"
        src="/pollination/seedbirth.webm"
        loop={true}
        autoplay={true}
        muted={true}
      />
    </div>
    <p class="text-medium text-new_purple py-8">
      What will be the name of your sprout?
    </p>
    <form on:submit|preventDefault class="mt-2">
      <div class="flex items-center justify-center">
        <input
          class="bg-transparent border-[2px] border-new_purple rounded-full placeholder-dark_grey text-center text-new_purple p-2 w-full"
          type="text w-screen"
          maxlength={LIMIT_CHARACTERS_PLANTNAME}
          bind:value={newName}
        />
      </div>
    </form>
    <ButtonBottom text={"Let it grow!"} onClick={() => onNameChosen(newName)} />
  </div>
</Layout>

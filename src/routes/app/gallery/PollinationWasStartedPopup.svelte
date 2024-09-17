<script lang="ts">
  import { goto } from "$app/navigation";
  import type { CandidatePlant, PublicUserInfo } from "$lib/types";
  import { onMount } from "svelte";
  import Cta from "../components/Cta.svelte";
  import Layout from "../components/Layout.svelte";
  import { pickRandomElement } from "random-elements";

  export let otherUser: PublicUserInfo;

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

<div class="fixed z-20 top-0 left-0 h-full overflow-auto bg-roel_green pb-32">
  <Layout title="Hooray!">
    <div class="text-regular text-small text-roel_green mb-10">
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
        autoplay
        loop
        muted
        playsinline
        class="absolute -bottom-10 w-screen pointer-events-none"
      >
        <!-- Fallback to HEIC H264 MOV with transparency if WebM is not supported -->
        <source src="/pollination/seedbirth.webm" type="video/webm" />
        <source src="/pollination/seedbirth.mov" type="video/quicktime" />
      </video>
    </div>
    <div class="text-medium text-new_purple py-10">
      {otherUser.username} has the privilege to name your new sprout.
    </div>
    <Cta onClick={() => goto(`/app/gallery`)}>Continue</Cta>
  </Layout>
</div>

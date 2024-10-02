<script lang="ts">
  import { goto } from "$app/navigation";
  import type { CandidatePlant, PublicUserInfo } from "$lib/types";
  import { onMount } from "svelte";
  import Cta from "../../../components/Cta.svelte";
  import Layout from "../../../components/Layout.svelte";
  import { pickRandomElement } from "random-elements";

  export let otherUser: PublicUserInfo;

  onMount(() => {});
</script>

<Layout title="Hooray!">
  <div class="grid grid-rows-[max_content_1fr_auto_1fr_max_content_1fr] h-full">
    <div class="text-regular text-small text-roel_green">
      You and {otherUser.username} gave life to a new seed together.
    </div>
    <div />
    <div class="relative flex items-center justify-center">
      <div class="flex items-center justify-center">
        <img class="w-1/2" src={`/pollination/Seed_01.png`} alt="Random seed" />
      </div>
      <video
        autoplay
        loop
        muted
        playsinline
        class="absolute -bottom-10 w-screen pointer-events-none"
      >
        <img
          class="absolute -bottom-10 w-screen pointer-events-none"
          src="/pollination/newplant.gif"
          alt="Animated seeds flying over the foreground"
        />
      </video>
    </div>
    <div />
    <div class="text-medium text-new_purple flex items-end">
      {otherUser.username} has the privilege to name your new sprout.
    </div>
    <div />
    <Cta umami="PollinationOtherUser" onClick={() => goto(`/app/gallery`)}
      >Continue</Cta
    >
  </div>
</Layout>

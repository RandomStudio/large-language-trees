<script lang="ts">
  import { LIMIT_CHARACTERS_PLANTNAME } from "$lib/constants";
  import type { PublicUserInfo } from "$lib/types";
  import { pickRandomElement } from "random-elements";
  import { onMount } from "svelte";
  import Layout from "../../../components/Layout.svelte";
  import Cta from "../../../components/Cta.svelte";
  import { capitalise } from "$lib/promptUtils";

  export let otherUserName: string;
  export let otherPlantName: string;
  export let yourPlantName: string;

  export let onNameChosen: (name: string) => void;

  let newName: string | null = null;
</script>

<Layout title="Hooray!">
  <div class="grid grid-rows-[max-content_auto_max-content_max-content_]">
    <div class="text-medium text-roel_green leading-tight">
      Your <span class="capitalize">{yourPlantName}</span> and
      <span class="capitalize">{otherUserName}</span>'s
      <span class="capitalize">{otherPlantName}</span> gave life to a new seed together.
    </div>
    <div class="relative flex items-center justify-center">
      <div class="flex items-center justify-center">
        <img class="w-3/4" src={`/pollination/Seed_01.png`} alt="Random seed" />
      </div>
      <img
        class="absolute -bottom-10 w-screen pointer-events-none"
        src="/pollination/newplant.gif"
        alt="Animated seeds flying over the foreground"
      />
    </div>
    <p class="text-medium text-new_purple pb-8">
      What will be the name of your sprout?
    </p>
    <form on:submit|preventDefault>
      <input
        class="bg-transparent border-[2px] border-new_purple rounded-full placeholder-dark_grey text-center text-new_purple p-2 w-full"
        type="text w-screen"
        maxlength={LIMIT_CHARACTERS_PLANTNAME}
        bind:value={newName}
      />
    </form>
    <Cta
      umami="NameChosen"
      disabled={newName === null}
      onClick={() => {
        if (newName) {
          onNameChosen(capitalise(newName.trim()));
        } else {
          console.warn("no valid name yet");
        }
      }}>OK</Cta
    >
  </div>
</Layout>

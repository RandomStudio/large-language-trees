<script lang="ts">
  import { buildPrompt } from "$lib/promptUtils";
  import type { SelectPlant } from "$lib/types";
  import { pickMultipleRandomElements } from "random-elements";
  import PromptConfigSection from "../../../components/PromptConfigSection.svelte";
  import type { PromptConfig } from "../../../defaults/prompt-config";
  import { onMount } from "svelte";

  enum Tabs {
    TEXT,
    IMAGE
  }

  let selectedTab = Tabs.TEXT;

  let finalPrompt: string = "";

  let parent1: SelectPlant | null = null;
  let parent2: SelectPlant | null = null;

  const pickRandomPlants = async () => {
    const allPlants = (await (
      await fetch("/api/plants")
    ).json()) as SelectPlant[];
    // console.log({ allPlants });
    const pickTwo = pickMultipleRandomElements(allPlants, 2);
    [parent1, parent2] = pickTwo;
  };

  onMount(async () => {
    await pickRandomPlants();
    preparePrompt();
  });

  const preparePrompt = () => {
    if (parent1 && parent2) {
      finalPrompt = JSON.stringify(
        buildPrompt(data, parent1, parent2),
        null,
        2
      );
    }
  };

  export let data: PromptConfig;
</script>

<main class="container p-4 w-screen">
  <h1 class="text-xl">Prompt Editor</h1>

  <button
    class={(selectedTab === Tabs.TEXT
      ? "bg-green-500"
      : "border-green-500 border-2") + " text-white py-2 px-4 rounded"}
    on:click={() => {
      selectedTab = Tabs.TEXT;
    }}>Text</button
  >
  <button
    class={(selectedTab === Tabs.IMAGE
      ? "bg-green-500"
      : "border-green-500 border-2") + "  text-white py-2 px-4 rounded"}
    on:click={() => {
      selectedTab = Tabs.IMAGE;
    }}>Images</button
  >

  {#if selectedTab === Tabs.TEXT}
    <h2 class="font-bold mt-4">Edit Text Prompts</h2>
    <PromptConfigSection sectionData={data.text.preamble} />
    <PromptConfigSection sectionData={data.text.explanation} />
    <PromptConfigSection sectionData={data.text.instructions} />
    <label class="block">
      Model
      <select class="">
        <option>Chat-GPT 3.5-turbo</option>
        <option>Chat-GPT 4-turbo</option>
      </select>
    </label>
    <div class="mt-8">
      <button class="bg-green-500 text-white py-2 px-4 rounded">Save</button>
      <button
        class="bg-green-500 text-white py-2 px-4 rounded"
        on:click={() => {
          pickRandomPlants();
          preparePrompt();
        }}>Pick random plants</button
      >
      <button class="bg-green-500 text-white py-2 px-4 rounded">Test</button>
    </div>

    {#if parent1 && parent2}
      <div>
        <h2>
          Test combining {parent1.commonName} + {parent2.commonName}
        </h2>
      </div>
      <pre class="w-full text-wrap text-xs">{finalPrompt}</pre>
    {/if}
  {/if}

  {#if selectedTab === Tabs.IMAGE}
    <h2>Edit Image Prompts</h2>
    <form></form>
  {/if}
</main>

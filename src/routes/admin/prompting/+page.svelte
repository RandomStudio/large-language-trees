<script lang="ts">
  import { buildPrompt } from "$lib/promptUtils";
  import type { InsertPlant, SelectPlant } from "$lib/types";
  import { pickMultipleRandomElements } from "random-elements";
  import PromptConfigSection from "../../../components/PromptConfigSection.svelte";
  import type { PromptConfig } from "../../../defaults/prompt-config";
  import { onMount } from "svelte";
  import type { GeneratePlantRequestBody } from "../../api/plants/generate/+server";
  import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
  import Spinner from "../../../components/Spinner.svelte";
  import DefaultPrompt from "../../../defaults/prompt-config";
  import { invalidateAll } from "$app/navigation";

  enum Tabs {
    TEXT,
    IMAGE
  }

  export let data: PromptConfig;

  let selectedTab = Tabs.TEXT;

  let resultPlantText: InsertPlant | null = null;
  let busy = false;

  let finalPrompt: ChatCompletionMessageParam[] = [];

  let parent1: SelectPlant | null = null;
  let parent2: SelectPlant | null = null;

  const backToDefaults = () => {
    console.log("Back to defaults!", DefaultPrompt);
    data = { ...DefaultPrompt };
  };

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
      finalPrompt = buildPrompt(data, parent1, parent2);
    }
  };

  const testGenerateText = async () => {
    if (parent1 && parent2) {
      const bodyData: GeneratePlantRequestBody = {
        prompt: finalPrompt,
        parents: [parent1, parent2],
        model: data.text.model
      };
      const offspring = (await (
        await fetch("/api/plants/generate", {
          method: "POST",
          body: JSON.stringify(bodyData)
        })
      ).json()) as InsertPlant;
      resultPlantText = offspring;
    }
  };
</script>

<main class="container p-4 w-screen">
  <h1 class="text-xl">Prompt Editor</h1>
  <div>
    <a href="/admin" class="text-xs italic">← Back to admin</a>
  </div>

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
    <form method="post" action="/admin/prompting">
      <PromptConfigSection
        name="textPreamble"
        sectionData={data.text.preamble}
        onChange={() => preparePrompt()}
      />
      <PromptConfigSection
        name="textExplanation"
        sectionData={data.text.explanation}
        onChange={() => preparePrompt()}
      />
      <PromptConfigSection
        name="textInstructions"
        sectionData={data.text.instructions}
        onChange={() => preparePrompt()}
      />
      <label class="block">
        Model
        <select bind:value={data.text.model} name="textModel">
          <option value={"gpt-3.5-turbo"}>Chat-GPT 3.5-turbo</option>
          <option value={"gpt-4-turbo"}>Chat-GPT 4-turbo</option>
        </select>
      </label>
      <div class="mt-8">
        <button
          class="bg-orange-500 text-white py-2 px-4 rounded"
          type="button"
          on:click={() => backToDefaults()}>Reset</button
        >

        <button class="bg-green-500 text-white py-2 px-4 rounded">Save</button>
        <button
          type="button"
          class="bg-green-500 text-white py-2 px-4 rounded"
          on:click={() => {
            pickRandomPlants();
            preparePrompt();
          }}>Pick random plants</button
        >
        <button
          type="button"
          class="bg-green-500 text-white py-2 px-4 rounded"
          on:click={async () => {
            busy = true;
            preparePrompt();
            await testGenerateText();
            busy = false;
          }}>Test</button
        >
      </div>

      {#if parent1 && parent2}
        <div>
          <h2>
            Test combining {parent1.commonName} + {parent2.commonName}
          </h2>
        </div>
        <pre class="w-full text-wrap text-xs p-4">{JSON.stringify(
            finalPrompt,
            null,
            2
          )}</pre>
      {/if}
    </form>
  {/if}

  {#if resultPlantText}
    <div
      class="m-8 p-4 rounded-sm shadow-2xl bg-slate-50 text-sm fixed top-16 border-2 border-slate-500"
    >
      <button
        class="bg-orange-500 text-white py-2 px-4 rounded"
        on:click={() => {
          resultPlantText = null;
        }}>Close ⓧ</button
      >
      <div>
        {JSON.stringify(resultPlantText, null, 2)}
      </div>
    </div>
  {/if}

  {#if selectedTab === Tabs.IMAGE}
    <h2>Edit Image Prompts</h2>
    <form></form>
  {/if}

  {#if busy}
    <Spinner />
  {/if}
</main>

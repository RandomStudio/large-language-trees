<script lang="ts">
  import { buildImagePrompt, buildTextPrompt } from "$lib/promptUtils";
  import type {
    GeneratedImage,
    GeneratedImageResult,
    InsertPlant,
    PromptConfig,
    SelectPlant
  } from "$lib/types";
  import {
    pickMultipleRandomElements,
    pickRandomElement
  } from "random-elements";
  import PromptConfigSection from "../../../../components/PromptConfigSection.svelte";
  import { onMount } from "svelte";
  import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
  import Spinner from "../../../../components/Spinner.svelte";
  import DefaultPrompt from "../../../../defaults/prompt-config";
  import type { GeneratePlantRequestBody } from "../../../api/plants/generate/types";
  import { type GenerateImageRequest } from "../../../api/images/generate/types";
  import TransparencyMaker from "../../../../components/TransparencyMaker.svelte";
  import { v4 as uuidv4 } from "uuid";

  enum Tabs {
    TEXT,
    IMAGE
  }

  export let data: PromptConfig;

  let selectedTab = Tabs.TEXT;

  let errorMessages: string | null = null;

  let resultPlantText: InsertPlant | null = null;
  let resultPlantImageUrl: string | null = null;
  let busy = false;

  let finalTextPrompt: ChatCompletionMessageParam[] = [];
  let finalImagePrompt: string | null = null;

  let parent1: SelectPlant | null = null;
  let parent2: SelectPlant | null = null;

  let plantForImage: SelectPlant | null = null;

  let candidateImagePoll: NodeJS.Timeout | null = null;

  const backToDefaults = () => {
    // console.log("Back to defaults!", DefaultPrompt);
    data = { ...DefaultPrompt };
  };

  const pickRandomParents = async () => {
    const allPlants = (await (
      await fetch("/api/plants")
    ).json()) as SelectPlant[];
    // console.log({ allPlants });
    const pickTwo = pickMultipleRandomElements(allPlants, 2);
    [parent1, parent2] = pickTwo;
  };

  const pickRandomPlantForImage = async () => {
    const allPlants = (await (
      await fetch("/api/plants")
    ).json()) as SelectPlant[];
    plantForImage = pickRandomElement(allPlants);
  };

  onMount(async () => {
    await pickRandomParents();
    await pickRandomPlantForImage();
    preparePrompts();
  });

  const preparePrompts = () => {
    if (parent1 && parent2) {
      finalTextPrompt = buildTextPrompt(data, parent1, parent2);
    }
    if (plantForImage) {
      finalImagePrompt = buildImagePrompt(
        data.image.instructions,
        plantForImage.description || ""
      );
      // console.log("Updated final image plant", finalImagePrompt);
    }
  };

  const runTextGeneration = async () => {
    errorMessages = null;
    if (parent1 && parent2) {
      const bodyData: GeneratePlantRequestBody = {
        prompt: finalTextPrompt,
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

  const runImageGeneration = async () => {
    errorMessages = null;
    const plantId = "test-only-" + uuidv4();
    if (plantForImage && finalImagePrompt) {
      const bodyData: GenerateImageRequest = {
        instructions: data.image.instructions,
        description: plantForImage.description || "",
        plantId,
        model: data.image.model
      };
      try {
        const res = await fetch("/api/images/generate", {
          method: "POST",
          body: JSON.stringify(bodyData)
        });
        if (res.status >= 500) {
          console.log("Error in generation");
          errorMessages = `ERROR in generation`;
        }
        // Do not expect immediate result; poll for candidate image
        if (candidateImagePoll) {
          clearInterval(candidateImagePoll);
        }
        candidateImagePoll = setInterval(async () => {
          console.log("Polling for candidate image...");
          const res = await fetch(`/api/plants/${plantId}/candidateImage`, {
            method: "GET"
          });
          if (res.status === 200) {
            console.log("...Image ready!");
            if (candidateImagePoll) {
              clearInterval(candidateImagePoll);
            }
            const generated = (await res.json()) as GeneratedImage;
            resultPlantImageUrl = generated.url;
            busy = false;
          }
        }, 2000);

        // const imageResult = (await res.json()) as GeneratedImageResult;
        // const { url } = imageResult;
        // resultPlantImageUrl = url;
      } catch (e) {
        console.log("Error in generation:", e);
        errorMessages = `ERROR ${JSON.stringify(e)}`;
      }
    }
  };
</script>

<main class="container p-4 w-screen">
  <h1 class="text-xl">Prompt Editor</h1>
  <div>
    <a href="/app/admin" class="text-xs italic">← Back to admin</a>
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

  {#if errorMessages !== null}
    <h4>Error messages</h4>
    <p class="bg-red-500 font-bold">{errorMessages}</p>
  {/if}

  {#if selectedTab === Tabs.TEXT}
    <h2 class="font-bold mt-4">Edit Text Prompts</h2>
    <form method="post" action="/admin/prompting">
      <PromptConfigSection
        name="textPreamble"
        sectionData={data.text.preamble}
        onChange={() => preparePrompts()}
      />
      <PromptConfigSection
        name="textExplanation"
        sectionData={data.text.explanation}
        onChange={() => preparePrompts()}
      />
      <PromptConfigSection
        name="textInstructions"
        sectionData={data.text.instructions}
        onChange={() => preparePrompts()}
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

        <button class="bg-red-500 text-white py-2 px-4 rounded">Save</button>
        <button
          type="button"
          class="bg-green-500 text-white py-2 px-4 rounded"
          on:click={() => {
            pickRandomParents();
            preparePrompts();
          }}>Pick random plants</button
        >
        <button
          type="button"
          class="bg-green-500 text-white py-2 px-4 rounded"
          on:click={async () => {
            busy = true;
            preparePrompts();
            await runTextGeneration();
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
            finalTextPrompt,
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
    <h2 class="font-bold mt-4">Edit Image Prompts</h2>

    <form method="post" action="/admin/prompting">
      <label class="block">
        Instructions
        <textarea
          class="w-full"
          name="imageInstructions"
          rows={10}
          bind:value={data.image.instructions}
          on:input={() => preparePrompts()}
        />
      </label>
      <label class="block">
        Model
        <select bind:value={data.image.model} name="imageModel">
          <option>dall-e-2</option>
          <option>dall-e-3</option>
        </select>
      </label>
      <div>
        <button
          class="bg-orange-500 text-white py-2 px-4 rounded"
          type="button"
          on:click={() => backToDefaults()}>Reset</button
        >
        <button class="bg-red-500 text-white py-2 px-4 rounded">Save</button>

        <button
          type="button"
          class="bg-green-500 text-white py-2 px-4 rounded"
          on:click={async () => {
            await pickRandomPlantForImage();
          }}>Pick Random Plant</button
        >
        <button
          type="button"
          class="bg-green-500 text-white py-2 px-4 rounded"
          on:click={async () => {
            busy = true;
            await runImageGeneration();
            // busy = false;
          }}>Test</button
        >
      </div>
    </form>

    {#if plantForImage}
      <h3 class="font-bold">Plant for image</h3>
      <h4>{plantForImage.commonName}</h4>
      <div>
        <h4>Description</h4>
        <p>{plantForImage.description}</p>
      </div>
      <div>
        <h4>Properties</h4>
        <p>{JSON.stringify(plantForImage.properties)}</p>
      </div>
      <pre class="w-full text-wrap text-xs p-4">{JSON.stringify(
          finalImagePrompt,
          null,
          2
        )}</pre>
    {/if}

    {#if resultPlantImageUrl}
      <div
        class="m-8 p-4 rounded-sm shadow-2xl bg-sky-400 text-sm fixed top-16 border-2 border-slate-500 w-screen"
      >
        <button
          class="bg-orange-500 text-white py-2 px-4 rounded"
          on:click={() => {
            resultPlantImageUrl = null;
          }}>Close ⓧ</button
        >
        <div class="w-9/12">
          <TransparencyMaker
            src={resultPlantImageUrl}
            onUploadComplete={(url) => {
              console.log("Replace image URL after upload:", url);
              resultPlantImageUrl = url;
            }}
            doUpload={true}
          />
        </div>
      </div>
    {/if}
  {/if}

  {#if busy}
    <Spinner />
  {/if}
</main>

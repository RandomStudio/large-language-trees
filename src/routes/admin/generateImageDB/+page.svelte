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
  import PromptConfigSection from "../../../components/PromptConfigSection.svelte";
  import { onMount } from "svelte";
  import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
  import Spinner from "../../../components/Spinner.svelte";
  import DefaultPrompt from "../../../defaults/prompt-config";
  import type { GeneratePlantRequestBody } from "../../api/plants/generate/types";
  import { type GenerateImageRequest } from "../../api/images/generate/types";
  import { v4 as uuidv4 } from "uuid";

  enum Tabs {
    TEXT,
    IMAGE
  }

  export let data: PromptConfig;

  let errorMessages: string | null = null;

  let resultPlantImageUrl: string | null = null;
  let busy = false;

  let plantForImage: SelectPlant | null = null;

  let allPlants: SelectPlant[] = [];

  let candidateImagePoll: NodeJS.Timeout | null = null;

  let index: number = 0;

  const pickPlantsForImage = async () => {
    allPlants = await (await fetch("/api/plants")).json();
  };

  onMount(async () => {
    await pickPlantsForImage();
  });

  const backToDefaults = () => {
    // console.log("Back to defaults!", DefaultPrompt);
    data = { ...DefaultPrompt };
  };

  const runImageGeneration = async () => {
    errorMessages = null;
    const plantId = "test-only-" + uuidv4();
    plantForImage = allPlants[index];
    const finalImagePrompt = buildImagePrompt(
      data.image.instructions,
      plantForImage.description || ""
    );
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

  const closeImage = () => {
    resultPlantImageUrl = null;
    index = index + 1;
  };
</script>

<main class="container p-4 w-screen">
  <h1 class="text-xl">Prompt Editor</h1>
  <div>
    <a href="/admin" class="text-xs italic">← Back to admin</a>
  </div>

  {#if errorMessages !== null}
    <h4>Error messages</h4>
    <p class="bg-red-500 font-bold">{errorMessages}</p>
  {/if}

  <button
    type="button"
    class="bg-green-500 text-white py-2 px-4 rounded"
    on:click={async () => {
      await pickPlantsForImage();
    }}>Pick the plants in the database</button
  >

  <h2>You will generate {allPlants.length} images</h2>

  <h2 class="font-bold mt-4">Edit Image Prompts</h2>

  <form method="post" action="/admin/prompting">
    <label class="block">
      Instructions
      <textarea
        class="w-full"
        name="imageInstructions"
        rows={10}
        bind:value={data.image.instructions}
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
        on:click={backToDefaults}>Reset</button
      >
      <button class="bg-red-500 text-white py-2 px-4 rounded">Save</button>

      <button
        type="button"
        class="bg-green-500 text-white py-2 px-4 rounded"
        on:click={async () => {
          busy = true;
          await runImageGeneration();
        }}>Generate the next image</button
      >
    </div>
  </form>

  {#if resultPlantImageUrl}
    <div
      class="flex justify-center items-center fixed inset-0 bg-gray-900 bg-opacity-75 z-50"
    >
      <div
        class="m-8 p-4 rounded-sm shadow-2xl bg-slate-50 text-sm border-2 border-slate-500 relative"
      >
        <button
          class="absolute top-0 right-0 bg-orange-500 text-white py-2 px-4 rounded"
          on:click={closeImage}>Close ⓧ</button
        >
        <img src={resultPlantImageUrl} alt="Result from the prompt test" />
      </div>
    </div>
  {/if}

  {#if busy}
    <Spinner />
  {/if}
</main>

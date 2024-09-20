<script lang="ts">
  import type { CandidatePlant, InsertPlant } from "$lib/types";
  import { TOLERANCE_SIMPLE } from "$lib/constants";
  import TransparencyMaker from "$lib/shared-components/TransparencyMaker.svelte";
  import PlantMorphSpinner from "$lib/shared-components/PlantMorphSpinner.svelte";
  import PopupError from "./PopupError.svelte";

  import { fade } from "svelte/transition";
  import {
    candidateToPlant,
    insertNewPlant
  } from "./PollinationFrontendFunctions";
  import { onMount } from "svelte";
  import Layout from "../../components/Layout.svelte";
  import Cta from "../../components/Cta.svelte";

  export let candidateChild: CandidatePlant;

  let userErrorMessage: string | null = null;

  /** A local copy of the incoming "candidateChild", which we update as necessary before
   * returning to the parent component ready to add to the database.
   */
  let finalChildReadyToAdd: InsertPlant = candidateToPlant(candidateChild);

  export let onCancel: () => any;
  export let onConfirm: () => any;

  let waitingForImage = false;
  let candidateImageUrl: string | null = candidateChild.imageUrl || null;
  let errorText: string = "";

  const finalise = async () => {
    await insertNewPlant(finalChildReadyToAdd);
    onConfirm();
  };

  const replaceImage = (url: string) => {
    console.log(
      "ConfirmBreedPopup replacing url",
      candidateImageUrl,
      "=>",
      url
    );
    candidateImageUrl = url;
    finalChildReadyToAdd.imageUrl = url;
  };

  onMount(() => {
    console.log("I'm here!", candidateChild);
    const updated = candidateToPlant(candidateChild);
    console.log({ updated });
    finalChildReadyToAdd = updated;
  });
</script>

<div class="fixed z-20 top-0 left-0 h-full overflow-auto bg-roel_green pb-32">
  <Layout title="Hooray you made a new plant!">
    {#if waitingForImage}
      <div
        class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-roel_green z-50"
      >
        <div class="flex flex-col items-center">
          <PlantMorphSpinner></PlantMorphSpinner>
          <div
            id="message"
            class="text-roel_blue font-primer text-2xl mt-4 text-center"
          >
            Please wait...
          </div>
        </div>
      </div>
    {/if}
    {#if candidateImageUrl}
      <div class="relative">
        <TransparencyMaker
          src={candidateImageUrl}
          useFloodFill={false}
          tolerance={TOLERANCE_SIMPLE}
          doUpload={true}
          onUploadComplete={(url) => {
            replaceImage(url);
            waitingForImage = false;
          }}
        />
        <img
          class="absolute -bottom-10 w-screen pointer-events-none"
          src="/pollination/newplant.gif"
          alt="Animated seeds flying over the foreground"
        />
      </div>
      <p class="mt-8 text-new_purple text-regular">{errorText}</p>
      <p class="mt-8 text-new_purple text-regular mb-0">
        {finalChildReadyToAdd.description}
      </p>

      <Cta onClick={finalise}>Continue</Cta>
    {/if}
  </Layout>
</div>

{#if waitingForImage}
  <div
    class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-roel_green z-50"
  >
    <div class="flex flex-col items-center">
      <PlantMorphSpinner></PlantMorphSpinner>
      <div
        id="message"
        class="text-roel_blue font-primer text-2xl mt-4 text-center"
      >
        Please wait...
      </div>
    </div>
  </div>
{/if}

{#if userErrorMessage}
  <PopupError errorText={userErrorMessage} onClick={onCancel}></PopupError>
{/if}

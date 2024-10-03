<script lang="ts">
  import type { CandidatePlant, InsertPlant } from "$lib/types";
  import { TOLERANCE_SIMPLE } from "$lib/constants";
  import TransparencyMaker from "$lib/shared-components/TransparencyMaker.svelte";
  import PopupError from "./PopupError.svelte";

  import { fade } from "svelte/transition";
  import {
    candidateToPlant,
    checkExistingCandidate,
    insertNewPlant
  } from "./PollinationFrontendFunctions";
  import { onMount } from "svelte";
  import Layout from "../../components/Layout.svelte";
  import Cta from "../../components/Cta.svelte";

  export let candidateChild: CandidatePlant;

  let userErrorMessage: string | null = null;
  let readyWithImage = false;

  /** A local copy of the incoming "candidateChild", which we update as necessary before
   * attempting to add to the DB
   */
  let finalInsertPlant: InsertPlant | null = null;

  export let onCancel: () => any;
  export let onConfirm: () => any;

  let errorText: string = "";

  let busy = false;

  const finalise = async () => {
    busy = true;
    if (finalInsertPlant) {
      const candidateStillExists =
        (await checkExistingCandidate(finalInsertPlant.id)) !== null;
      if (candidateStillExists) {
        console.info("candidate plant still exists, so we DO need to add it");
        try {
          await insertNewPlant(finalInsertPlant);
        } catch (e) {
          console.warn("Plant insert failed, possibly it was added already");
        }
      } else {
        console.warn(
          "The candidate plant no longer exists in the generatedPlants list; probably was added already"
        );
        // DO NOTHING
      }
    }

    // No matter what happens above, confirm and close...
    onConfirm();
    busy = false;
  };

  const addProcessedImage = async (url: string) => {
    if (finalInsertPlant) {
      // First, check if the generatedPlant entry hasn't ALREADY got a processed image...
      const candidateStillExisting = await checkExistingCandidate(
        finalInsertPlant.id
      );
      if (
        candidateStillExisting &&
        candidateStillExisting.processedImageUrl === null
      ) {
        console.log(
          "Candidate still exists, has not processed image saved (yet)"
        );
        finalInsertPlant.imageUrl = url;
      }
    }
    readyWithImage = true;
  };

  onMount(() => {
    const updated = candidateToPlant(candidateChild);
    console.log({ updated });
    finalInsertPlant = updated;
  });
</script>

<div class="fixed z-20 top-0 left-0 h-full overflow-auto bg-roel_green pb-32">
  <Layout title="Hooray you made a new plant!">
    {#if candidateChild.originalImageUrl}
      <div class="relative">
        <TransparencyMaker
          src={candidateChild.originalImageUrl}
          useFloodFill={false}
          tolerance={TOLERANCE_SIMPLE}
          doUpload={true}
          onUploadComplete={(url) => {
            addProcessedImage(url);
          }}
        />
        <img
          class="absolute -bottom-10 w-screen pointer-events-none"
          src="/pollination/newplant.gif"
          alt="Animated seeds flying over the foreground"
        />
      </div>
      {#if errorText}
        <p class="mt-8 text-new_purple text-regular">{errorText}</p>
      {/if}
      <p class="mt-4 text-new_purple text-regular text-center text-small mb-0">
        {finalInsertPlant?.description}
      </p>
      <p class="mb-64"></p>
    {/if}
    {#if readyWithImage}
      <Cta umami="ConfirmBreed" disabled={busy} onClick={finalise}>OK</Cta>
    {/if}
  </Layout>
</div>

{#if userErrorMessage}
  <PopupError errorText={userErrorMessage} onClick={onCancel}></PopupError>
{/if}

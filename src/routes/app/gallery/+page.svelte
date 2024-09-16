<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    type CandidatePlant,
    type InsertPlant,
    type PublicUserInfo,
    type SelectPlant
  } from "../../../lib/types";
  import { onDestroy, onMount } from "svelte";

  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import PopupInfo from "./PopupInfo.svelte";

  import { invalidateAll } from "$app/navigation";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../defaults/tether";
  import {
    type EventNewSprouting,
    type EventGeneratedPlantReady,
    type EventPollinationStarting
  } from "$lib/events.types";
  import { MAX_CANVASSES, PLUG_NAMES } from "$lib/constants";
  import ConfirmBreedPopup from "./pollinate/ConfirmBreedPopup.svelte";
  import PollinationWasStartedPopup from "./PollinationWasStartedPopup.svelte";
  import { candidateToPlant } from "./pollinate/PollinationFrontendFunctions";

  export let data;
  type GalleryViewData = typeof data;

  let candidateChild: CandidatePlant | null = null;
  let selectedPlantForInfo: SelectPlant | null = null;

  let otherUserStartedPollination: PublicUserInfo | null = null;

  let agent: TetherAgent | null;

  onMount(async () => {
    agent = await TetherAgent.create("app", {
      brokerOptions: BROWSER_CONNECTION
    });

    const newPlantAdded = await InputPlug.create(
      agent,
      PLUG_NAMES.simpleEvents,
      {
        id: "newPlantSprouted"
      }
    );
    newPlantAdded.on("message", (payload) => {
      const m = decode(payload) as EventNewSprouting;
      if (
        m.payload.authorTop === data.user.id ||
        m.payload.authorBottom === data.user.id
      ) {
        console.log("A new plant was sprouted (added)", m.payload);
        invalidateAll();
      }
    });

    const newCandidatePlantReady = await InputPlug.create(
      agent,
      PLUG_NAMES.simpleEvents,
      {
        id: "newGeneratedPlantReady"
      }
    );
    newCandidatePlantReady.on("message", (payload) => {
      const m = decode(payload) as EventGeneratedPlantReady;
      console.log("New plant ready. Is it mine...?", m.payload);
      if (m.payload.authorTop === data.user.id) {
        console.log("New plant ready, and needs my input:", m.payload);
        candidateChild = m.payload;
      }
    });
  });

  onDestroy(() => {
    // if (datesInterval) {
    //   clearInterval(datesInterval);
    // }
    if (agent) {
      agent.disconnect();
    }
  });

  const gotoPollinate = (plantId: string) => {
    goto(`/app/gallery/scan/${plantId}`);
  };
</script>

{#if otherUserStartedPollination}
  <PollinationWasStartedPopup otherUser={otherUserStartedPollination} />
{/if}

<div class="mt-16 mx-10 font-primer text-roel_blue text-left">
  <PlantDisplay
    disableAnimation={false}
    imageUrl={data.myOriginalPlant.plant.imageUrl || ""}
    applyFilters={false}
    label={data.myOriginalPlant.plant.commonName}
  />

  {#each data.awaitingConfirmation as candidatePlant}
    {#if candidatePlant.authorTopUser && candidatePlant.authorBottomUser}
      {candidatePlant.authorTopUser.username} ❤️ {candidatePlant
        .authorBottomUser.username}
    {/if}
    <button
      class="cursor-pointer mt-4 border-2 border-blue-500"
      on:click={async () => {
        candidateChild = candidatePlant;
      }}
    >
      <div>Now...</div>
      <PlantDisplay
        disableAnimation={true}
        imageUrl={"/pollination/Seed_01.png"}
        applyFilters={false}
        label={candidatePlant.givenName}
      />
    </button>
  {/each}

  {#each data.notSproutedPlants as plant}
    {#if plant.authorTopUser && plant.authorBottomUser}
      {plant.authorTopUser.username} ❤️ {plant.authorBottomUser.username}
    {/if}
    <PlantDisplay
      disableAnimation={true}
      imageUrl={"/pollination/Seed_01.png"}
      applyFilters={false}
      label={plant.givenName}
    />
  {/each}

  {#each data.myOtherPlants as plant, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- <code>{plant.plant.timeLeft.toFormat("mm:ss")}</code> -->
    <button
      on:click={() => {
        console.log("click!");
        selectedPlantForInfo = plant.plant;
      }}
      class="cursor-pointer mt-4 border-2 border-orange-50"
    >
      <PlantDisplay
        disableAnimation={index > MAX_CANVASSES - 1}
        imageUrl={plant.plant.imageUrl || ""}
        applyFilters={false}
        label={plant.plant.commonName}
      />
    </button>
  {/each}
</div>

{#if selectedPlantForInfo}
  <PopupInfo
    plantDetails={selectedPlantForInfo}
    closePopup={() => {
      selectedPlantForInfo = null;
    }}
  ></PopupInfo>
{/if}

{#if candidateChild}
  <ConfirmBreedPopup
    {candidateChild}
    onCancel={() => {
      candidateChild = null;
    }}
    onConfirm={() => {
      candidateChild = null;
      invalidateAll();
    }}
  />
{/if}

<div class="fixed bottom-0 w-screen content-center">
  <button
    on:click={() => gotoPollinate(data.myOriginalPlant.plant.id)}
    data-test="start-pollinating-button"
    data-umami-event="Start Pollinating Button"
    class="bg-roel_blue text-roel_green font-primer text-3xl px-4 py-[0.5rem] mb-5 border-2 w-11/12 max-w-xs border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green"
  >
    Start Pollinating
  </button>
</div>

<!-- <div>{JSON.stringify(candidateChild)}</div> -->

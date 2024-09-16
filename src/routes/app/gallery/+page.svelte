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
  import PlantWasAddedPopup from "./PlantWasAddedPopup.svelte";
  import ConfirmBreedPopup from "./pollinate/ConfirmBreedPopup.svelte";
  import { candidateToPlant } from "./pollinate/PollinationFrontendFunctions";
  import Layout from "../components/Layout.svelte";
  import PollinationWasStartedPopup from "./PollinationWasStartedPopup.svelte";

  export let data;
  type GalleryViewData = typeof data;

  let candidateChild: InsertPlant | null = null;
  let selectedPlantForInfo: SelectPlant | null = null;

  let otherUserStartedPollination: PublicUserInfo | null = null;
  let otherUserAddedPlant: SelectPlant | null = null;

  let agent: TetherAgent | null;

  onMount(async () => {
    agent = await TetherAgent.create("app", {
      brokerOptions: BROWSER_CONNECTION
    });

    const newPollinationStartedPlug = await InputPlug.create(
      agent,
      PLUG_NAMES.simpleEvents,
      {
        id: "newPollinationStarting"
      }
    );
    newPollinationStartedPlug.on("message", (payload) => {
      const m = decode(payload) as EventPollinationStarting;
      if (m.payload.authorBottom.id === data.user.id) {
        console.log(
          "New pollination started for plant of which I am the 'other' author",
          m.payload
        );
        otherUserStartedPollination = m.payload.authorTop;
        setTimeout(() => {
          console.log("Now clear popup...");
          otherUserStartedPollination = null;
          invalidateAll();
        }, 4000);
      }
    });

    const newPlantAddedPopup = await InputPlug.create(
      agent,
      PLUG_NAMES.simpleEvents,
      {
        id: "newPlantSprouted"
      }
    );
    newPlantAddedPopup.on("message", (payload) => {
      const m = decode(payload) as EventNewSprouting;
      if (m.payload.authorBottom === data.user.id) {
        console.log(
          "New plant added by other user and belongs to me",
          m.payload
        );
        otherUserAddedPlant = m.payload;

        setTimeout(() => {
          console.log("Now clear popup...");
          otherUserAddedPlant = null;
          invalidateAll();
        }, 4000);
      }
      // For any "newPlantPollination" event, reload page data just in case
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

{#if otherUserAddedPlant}
  <PlantWasAddedPopup plant={otherUserAddedPlant} />
{/if}

<Layout title="Let's Pollinate">
<div class="mt-16 mx-10 font-primer text-roel_blue text-left">
  <PlantDisplay
    disableAnimation={false}
    imageUrl={data.myOriginalPlant.plant.imageUrl || ""}
    applyFilters={false}
    label={data.myOriginalPlant.plant.commonName}
  />

  {#each data.myOtherPlants as plant, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- <code>{plant.plant.timeLeft.toFormat("mm:ss")}</code> -->
    <div
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
    </div>
  {/each}

  {#each data.notSproutedPlants as plant}
    {#if plant.authorTop && plant.authorBottom}
      {plant.authorTop.username} ❤️ {plant.authorBottom.username}
    {/if}
    <PlantDisplay
      disableAnimation={false}
      imageUrl={data.myOriginalPlant.plant.imageUrl || ""}
      applyFilters={false}
      label={data.myOriginalPlant.plant.commonName}
    />

  {#if selectedPlantForInfo}
    <PopupInfo
      plantDetails={selectedPlantForInfo}
      closePopup={() => {
        selectedPlantForInfo = null;
      }}
    ></PopupInfo>
  {/if}

    {#each data.notSproutedPlants as plant}
      {#if plant.authorTop && plant.authorBottom}
        {plant.authorTop.username} ❤️ {plant.authorBottom.username}
      {/if}
      <PlantDisplay
        disableAnimation={true}
        imageUrl={"/pollination/Seed_01.png"}
        applyFilters={false}
        label={plant.givenName}
      />
    {/each}
  </div>

  {#if selectedPlant}
    <PopupInfo
      plantDetails={selectedPlant}
      closePopup={() => {
        selectedPlant = null;
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
</Layout>
<!-- <div>{JSON.stringify(candidateChild)}</div> -->

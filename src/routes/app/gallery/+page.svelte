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
  import Layout from "../components/Layout.svelte";
  import { candidateToPlant } from "./pollinate/PollinationFrontendFunctions";
  import Cta from "../components/Cta.svelte";
  import CollectionPlant from "../components/CollectionPlant.svelte";
  import TopRightButton from "$lib/shared-components/TopRightButton.svelte";
  import AppInfoPopup from "./AppInfoPopup.svelte";

  export let data;
  type GalleryViewData = typeof data;

  let candidateChild: CandidatePlant | null = null;
  let selectedPlantForInfo: SelectPlant | null = null;

  let otherUserStartedPollination: PublicUserInfo | null = null;

  let isAppInfoOpen = false;
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

  const handleClickPlant = (plant: SelectPlant | CandidatePlant) => {
    if ("commonName" in plant) {
      selectedPlantForInfo = plant as SelectPlant;
    }
  };
</script>

<Layout title={undefined}>
  {#if !isAppInfoOpen && !selectedPlantForInfo}
    <TopRightButton
      onClick={() => {
        isAppInfoOpen = true;
      }}>i</TopRightButton
    >
  {/if}
  <div class="text-roel_purple pb-20">
    <div class="mb-12">
      <PlantDisplay
        disableAnimation={false}
        imageUrl={data.myOriginalPlant.plant.imageUrl || ""}
        applyFilters={false}
        label={data.myOriginalPlant.plant.commonName}
        description="Has pollinated {data.pollinationCount} other plants"
      />
    </div>
    {#each data.awaitingConfirmation as candidatePlant}
      <CollectionPlant
        authorTopUser={candidatePlant.authorTopUser}
        authorBottomUser={candidatePlant.authorBottomUser}
        isReadyToSprout
        onClick={handleClickPlant}
        plant={candidatePlant}
      />
    {/each}

    {#each data.notSproutedPlants as plant}
      <CollectionPlant
        authorTopUser={plant.authorTopUser}
        authorBottomUser={plant.authorBottomUser}
        onClick={handleClickPlant}
        {plant}
      />
    {/each}

    {#each data.myOtherPlants as plant, index}
      <CollectionPlant
        authorTopUser={undefined}
        authorBottomUser={undefined}
        disableAnimation={index > MAX_CANVASSES - 1}
        onClick={handleClickPlant}
        plant={plant.plant}
      />
    {/each}

    {#if selectedPlantForInfo}
      <PopupInfo
        plantDetails={selectedPlantForInfo}
        closePopup={() => {
          selectedPlantForInfo = null;
        }}
      ></PopupInfo>
    {/if}

    {#if isAppInfoOpen}
      <AppInfoPopup
        closePopup={() => {
          console.log("fire");
          isAppInfoOpen = false;
        }}
      />
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
    <Cta
      umami="Start Pollinating Button"
      onClick={() => gotoPollinate(data.myOriginalPlant.plant.id)}
      test="start-pollinating"
    >
      Start Pollinating
    </Cta>
  </div>
</Layout>
<!-- <div>{JSON.stringify(candidateChild)}</div> -->

<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    type CandidatePlant,
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
    DisplayEventNames,
    SimpleEventNames
  } from "$lib/events.types";
  import { MAX_CANVASSES, PLUG_NAMES } from "$lib/constants";
  import ConfirmBreedPopup from "./pollinate/ConfirmBreedPopup.svelte";
  import Layout from "../components/Layout.svelte";
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
  let agent: TetherAgent | null = null;

  let pollForPlantsReady: NodeJS.Timeout | null = null;
  let pollForPlantsAdded: NodeJS.Timeout | null = null;

  const pollForMyPlants = async () => {
    const res = await fetch("/api/plants/generated");
    const candidatePlants = (await res.json()) as CandidatePlant[];
    return candidatePlants
      .filter((c) => c.awaitingConfirmation === true)
      .find((c) => c.authorTop === data.user.id);
  };

  const pollForMyPlantsAdded = async () => {
    const res = await fetch(`/api/plantsInGarden?userId=${data.user.id}`);
    const plants = (await res.json()) as SelectPlant[];
    if (plants.length !== data.myOtherPlants.length + 1) {
      console.log("Length of my plants seems to have changed; reload");
      invalidateAll();
    }
  };

  onMount(async () => {
    if (agent === null) {
      agent = await TetherAgent.create("app", {
        brokerOptions: BROWSER_CONNECTION
      });
      console.log("after connect, agent==", agent);
    }

    const newPlantAdded = await InputPlug.create(
      agent,
      PLUG_NAMES.simpleEvents,
      {
        id: SimpleEventNames.POLLINATION_COMPLETE
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
        id: SimpleEventNames.CANDIDATE_READY
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

    //Also, as a backup, poll for generated plants...
    if (pollForPlantsReady === null) {
      pollForPlantsReady = setInterval(() => {
        pollForMyPlants().then((matchingPlant) => {
          if (matchingPlant) {
            console.log(
              "Server polling got new plant that is ready and needs my input:",
              matchingPlant
            );
            candidateChild = matchingPlant;
            // if (pollForPlantsReady) {
            //   clearInterval(pollForPlantsReady);
            // }
          }
        });
      }, 3000);
    }

    // Also, as a backup, poll for added plants...
    if (pollForPlantsAdded === null) {
      pollForPlantsAdded = setInterval(() => {
        pollForMyPlantsAdded();
      }, 3000);
    }
  });

  onDestroy(() => {
    console.log("gallery onDestroy...");
    if (pollForPlantsReady) {
      clearInterval(pollForPlantsReady);
    }
    if (agent) {
      console.log("...disconnect Tether");
      agent.disconnect();
      agent = null;
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

<Layout hasScroll title={undefined}>
  {#if !isAppInfoOpen && !selectedPlantForInfo && !candidateChild}
    <TopRightButton
      onClick={() => {
        isAppInfoOpen = true;
      }}>i</TopRightButton
    >
  {/if}
  <div class="text-new_purple pb-32">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="mb-12"
      on:click={() => handleClickPlant(data.myOriginalPlant.plant)}
    >
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
        isPending
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

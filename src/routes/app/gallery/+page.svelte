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

  interface PlantWithUsersAndParents extends SelectPlant {
    authorTopUser: PublicUserInfo | null;
    authorBottomUser: PublicUserInfo | null;
    parentTopPlant: string | null;
    parentBottomPlant: string | null;
    isOriginalPlant: boolean;
  }

  let selectedPlantForInfo: PlantWithUsersAndParents | null = null;

  let isAppInfoOpen = false;
  let agent: TetherAgent | null = null;

  let pollForPlantsReady: NodeJS.Timeout | null = null;
  let pollForPlantsAdded: NodeJS.Timeout | null = null;

  const pollForMyPlants = async () => {
    const res = await fetch("/api/plants/generated  ");
    const candidatePlants = (await res.json()) as CandidatePlant[];
    return candidatePlants
      .filter((c) => c.awaitingConfirmation === true)
      .find(
        (c) => c.authorTop === data.user.id || c.authorBottom === data.user.id
      );
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
      if (
        m.payload.authorTop === data.user.id ||
        m.payload.authorBottom === data.user.id
      ) {
        invalidateAll();
        // NB: We wait for user input to set this as the candidate plant to confirm!
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
            // NB: We wait for user input to set this as the candidate plant to confirm!
            invalidateAll();
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
      console.log("Gallery disconnect Tether");
      agent.disconnect();
      agent = null;
    }
  });

  const gotoPollinate = (plantId: string) => {
    goto(`/app/gallery/scan/${plantId}`);
  };

  // const handleClickPlant = (plant: SelectPlant | CandidatePlant) => {
  //   console.log("handleClickPlant", plant);
  //   if ("commonName" in plant) {
  //     selectedPlantForInfo = plant as PlantWithUsers;
  //   }
  //   if ("awaitingConfirmation" in plant) {
  //     candidateChild = plant as CandidatePlant;
  //   }
  // };
</script>

<Layout hasScroll title={undefined}>
  {#if !isAppInfoOpen && !selectedPlantForInfo && !candidateChild}
    <TopRightButton
      onClick={() => {
        isAppInfoOpen = true;
      }}>i</TopRightButton
    >
  {/if}
  <div class="text-new_purple">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="mb-12"
      on:click={() => {
        selectedPlantForInfo = {
          ...data.myOriginalPlant.plant,
          parentTopPlant: null,
          parentBottomPlant: null,
          isOriginalPlant: true
        };
      }}
    >
      <div
        class="font-primer text-roel_green text-center text-large font-semibold -mt-4"
      >
        Your {data.myOriginalPlant.plant.commonName}
      </div>
      <div class="font-primer text-small text-roel_green text-center mb-4">
        ...has pollinated {data.pollinationCount} other plants
      </div>
      <PlantDisplay
        disableAnimation={false}
        imageUrl={data.myOriginalPlant.plant.imageUrl || ""}
        applyFilters={false}
      />
    </div>
    {#each data.awaitingConfirmation as candidatePlant}
      <CollectionPlant
        authorTopUser={candidatePlant.authorTopUser}
        authorBottomUser={candidatePlant.authorBottomUser}
        parentTopPlant={candidatePlant.parentPlantTop.commonName}
        parentBottomPlant={candidatePlant.parentPlantBottom.commonName}
        isReadyToSprout
        onClick={() => {
          candidateChild = candidatePlant;
        }}
        plant={candidatePlant}
        hasError={candidatePlant.errorMessage}
      />
    {/each}

    {#each data.notSproutedPlants as candidatePlant}
      <CollectionPlant
        authorTopUser={candidatePlant.authorTopUser}
        authorBottomUser={candidatePlant.authorBottomUser}
        isBeingGenerated
        onClick={() => {
          console.log("Not sprouted... no info");
        }}
        hasError={candidatePlant.errorMessage}
        plant={candidatePlant}
      />
    {/each}

    {#each data.myOtherPlants as { plant }, index}
      <CollectionPlant
        authorTopUser={plant.authorTopUser}
        authorBottomUser={plant.authorBottomUser}
        parentTopPlant={plant.parentPlantTop?.commonName}
        parentBottomPlant={plant.parentPlantBottom?.commonName}
        disableAnimation={index > MAX_CANVASSES - 1}
        onClick={() => {
          selectedPlantForInfo = {
            ...plant,
            authorTopUser: plant.authorTopUser,
            authorBottomUser: plant.authorBottomUser,
            parentTopPlant: plant.parentPlantTop?.commonName || null,
            parentBottomPlant: plant.parentPlantBottom?.commonName || null,
            isOriginalPlant: false
          };
        }}
        {plant}
      />
    {/each}

    {#if selectedPlantForInfo}
      <PopupInfo
        plantDetails={selectedPlantForInfo}
        authorTopUser={selectedPlantForInfo.authorTopUser}
        authorBottomUser={selectedPlantForInfo.authorBottomUser}
        parentTopPlant={selectedPlantForInfo.parentTopPlant}
        parentBottomPlant={selectedPlantForInfo.parentBottomPlant}
        isOriginalPlant={selectedPlantForInfo.isOriginalPlant}
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

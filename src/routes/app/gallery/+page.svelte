<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    type InsertPlant,
    type PlantWithDate,
    type SelectPlant
  } from "../../../lib/types";
  import { onDestroy, onMount } from "svelte";
  import { DateTime } from "luxon";

  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import PopupInfo from "./PopupInfo.svelte";

  import { invalidateAll } from "$app/navigation";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../defaults/tether";
  import { type EventNewPollination } from "$lib/events.types";
  import {
    DURATION_TILL_FERTILE,
    MAX_CANVASSES,
    PLUG_NAMES
  } from "$lib/constants";
  import PlantWasAddedPopup from "./PlantWasAddedPopup.svelte";

  export let data;
  type GalleryViewData = typeof data;

  // function addTimeLeft(inputData: GalleryViewData) {
  //   return {
  //     ...inputData.userWithSeedbankPlants,
  //     seedbank: {
  //       ...inputData,
  //       plantsInSeedbank: inputData.seedbank.plantsInSeedbank.map((p) => ({
  //         ...p,
  //         plant: {
  //           ...p.plant,
  //           timeLeft: DateTime.fromJSDate(p.pollinationDate)
  //             .plus(DURATION_TILL_FERTILE)
  //             .diffNow()
  //         }))
  //         }
  //       }))
  //     },
  //     garden: {
  //       ...inputData.garden,
  //       plantsInGarden: [
  //         // ...inputData.garden.plantsInGarden
  //         ...inputData.garden.plantsInGarden.map((p) => ({
  //           ...p,
  //       ]
  //     }
  //   };
  // }

  // let dataWithTimes = addTimeLeft(data);

  let selectedPlant: SelectPlant | null = null;

  let yourOriginalPlant: SelectPlant | null =
    data.plants.find(
      (plant) => plant.plant.parent1 == null && plant.plant.parent2 == null
    )?.plant || null;

  // function updateTimeLeft() {
  //   dataWithTimes = addTimeLeft(data);
  // }

  let agent: TetherAgent | null;

  // let datesInterval: NodeJS.Timeout | null = null;

  let newPlantForPopup: InsertPlant | null = null;

  onMount(async () => {
    // datesInterval = setInterval(updateTimeLeft, 1000);
    // const databaseInterval = setInterval(fetchdata, 1000);

    agent = await TetherAgent.create("app", {
      brokerOptions: BROWSER_CONNECTION
    });

    const eventsPlug = await InputPlug.create(agent, PLUG_NAMES.simpleEvents, {
      id: "newPlantPollination"
    });
    eventsPlug.on("message", (payload) => {
      const m = decode(payload) as EventNewPollination;
      if (
        m.payload.authorTop === data.user.id ||
        m.payload.authorBottom === data.user.id
      ) {
        console.log("This plant belongs to me!", m.payload);
        newPlantForPopup = m.payload;

        setTimeout(() => {
          console.log("Now clear popup...");
          newPlantForPopup = null;
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

{#if newPlantForPopup}
  <PlantWasAddedPopup plant={newPlantForPopup} />
{/if}

<div class="mt-16 mx-10 font-primer text-roel_blue text-left">
  <div
    class="text-roel_blue font-primer text-3xl text-center border-b-[3px] border-roel_blue rounded-lg px-4 py-2"
  >
    {data.garden.name}
  </div>
  {#each data.plants as plant, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- <code>{plant.plant.timeLeft.toFormat("mm:ss")}</code> -->
    <div
      on:click={() => {
        console.log("click!");
        selectedPlant = plant.plant;
      }}
      class="cursor-pointer mt-4"
    >
      <PlantDisplay
        disableAnimation={index > MAX_CANVASSES - 1}
        imageUrl={plant.plant.imageUrl || ""}
        applyFilters={false}
      />
    </div>
    <div class="mt-4 text-center">
      <button
        on:click={() => gotoPollinate(plant.plant.id)}
        data-test="start-pollinating-button"
        data-umami-event="Start Pollinating Button"
        class="bg-roel_blue text-roel_green font-primer text-3xl px-4 py-[0.5rem] mb-5 border-2 w-11/12 max-w-xs border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green"
      >
        Start Pollinating
      </button>
    </div>
  {/each}
  <br />
  <br />
</div>

{#if selectedPlant}
  <PopupInfo
    plantDetails={selectedPlant}
    closePopup={() => {
      selectedPlant = null;
    }}
    isOriginalPlant={selectedPlant.id == yourOriginalPlant?.id}
    isPollinatingPlant={true}
    onStartPollinate={() => {
      // Crazy to have to check for null again
      if (selectedPlant) gotoPollinate(selectedPlant.id);
    }}
  ></PopupInfo>
{/if}

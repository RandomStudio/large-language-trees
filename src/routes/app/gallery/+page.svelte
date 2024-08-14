<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    type GardenViewData,
    type InsertPlant,
    type SelectPlant
  } from "../../../lib/types";
  import { onDestroy, onMount } from "svelte";
  import { DateTime } from "luxon";

  import PlantDisplay from "../../../components/PlantDisplay.svelte";
  import PopupInfo from "../../../components/PopupInfo.svelte";

  import { invalidateAll } from "$app/navigation";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../defaults/tether";
  import { type EventNewPollination } from "$lib/events.types";
  import { DURATION_TILL_FERTILE, PLUG_NAMES } from "$lib/constants";
  import PlantWasAddedPopup from "./pollination/PlantWasAddedPopup.svelte";

  function addTimeLeft(inputData: GardenViewData) {
    return {
      ...inputData,
      seedbank: {
        ...inputData.seedbank,
        plantsInSeedbank: inputData.seedbank.plantsInSeedbank.map((p) => ({
          ...p,
          plant: {
            ...p.plant,
            timeLeft: DateTime.fromJSDate(p.plant.created)
              .plus(DURATION_TILL_FERTILE)
              .diffNow()
          }
        }))
      }
    };
  }

  export let data: GardenViewData;

  let dataWithTimes = addTimeLeft(data);
  console.log(dataWithTimes);

  let selectedPlant: SelectPlant | null = null;

  function handleClick(id: string) {
    goto(`gallery/pollination/` + id);
  }

  let yourOriginalPlant: SelectPlant | null =
    data.seedbank.plantsInSeedbank.find(
      (plant) => plant.plant.parent1 == null && plant.plant.parent2 == null
    )?.plant || null;

  function updateTimeLeft() {
    dataWithTimes = addTimeLeft(data);
  }

  let agent: TetherAgent | null;

  let datesInterval: NodeJS.Timeout | null = null;

  let newPlantForPopup: InsertPlant | null = null;

  onMount(async () => {
    datesInterval = setInterval(updateTimeLeft, 1000);
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
    if (datesInterval) {
      clearInterval(datesInterval);
    }
    if (agent) {
      agent.disconnect();
    }
  });
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
  {#each dataWithTimes.seedbank.plantsInSeedbank as plant}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- <code>{plant.plant.timeLeft.toFormat("mm:ss")}</code> -->
    {#if plant.plant.parent1 == null || plant.plant.timeLeft.milliseconds <= 0}
      <div
        on:click={() => {
          console.log("click!");
          selectedPlant = plant.plant;
        }}
        class="cursor-pointer mt-4"
      >
        <PlantDisplay plant={plant.plant} applyFilters={false} />
      </div>
      <div class="mt-4 text-center">
        <button
          data-test="start-pollinating-button"
          data-umami-event="Start Pollinating Button"
          class="bg-roel_blue text-roel_green font-primer text-3xl px-4 py-[0.5rem] mb-5 border-2 w-11/12 max-w-xs border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green"
          on:click={() => handleClick(plant.plant.id)}
        >
          Start Pollinating
        </button>
      </div>
    {:else}
      <div
        on:click={() => {
          console.log("click!");
          selectedPlant = plant.plant;
        }}
        class="cursor-pointer mt-4"
      >
        <PlantDisplay plant={plant.plant} applyFilters={true} />
      </div>
      <div class="mt-4 text-center">
        <button
          class="bg-roel_green text-roel_blue font-primer text-2xl px-4 py-2 w-11/12 max-w-xs border-roel_blue border-[3px] rounded-full text-opacity-100"
        >
          Fertile in {plant.plant.timeLeft.toFormat("mm:ss")}
        </button>
      </div>
    {/if}
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
    isPollinatingPlant={DateTime.fromJSDate(selectedPlant.created).diffNow() >
      DURATION_TILL_FERTILE}
  ></PopupInfo>
{/if}

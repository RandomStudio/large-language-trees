<script lang="ts">
  import { goto } from "$app/navigation";
  import { type GardenViewData, type SelectPlant } from "../../../lib/types";
  import { onMount } from "svelte";
  export let data: GardenViewData;
  import PlantDisplay from "../../../components/PlantDisplay.svelte";
  import PopupInfo from "../../../components/PopupInfo.svelte";

  import { invalidateAll } from "$app/navigation";
  import moment from "moment";

  let selectedPlant: SelectPlant | null = null;

  function handleClick(id: string) {
    goto(`gallery/pollination/` + id);
  }

  function convertMinutesToMinutesAndSeconds(decimalMinutes: number) {
    const minutes = Math.floor(decimalMinutes);
    const seconds = Math.round((decimalMinutes - minutes) * 60);
    return minutes != 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;
  }

  let yourPlant: SelectPlant | null =
    data.seedBank.plantsInSeedbank.find(
      (plant) => plant.plant.parent1 == null && plant.plant.parent2 == null
    )?.plant || null;

  let dates: number[] = [];

  async function updateDates() {
    const now = moment();
    const newDates = [];
    let index = 0;
    for (const [key, plant] of Object.entries(data.seedBank.plantsInSeedbank)) {
      const createdDate = moment(plant.plant.created);
      const duration = moment.duration(now.diff(createdDate));
      const minutes = duration.asMinutes();
      newDates[index] = minutes;
      index++;
    }
    dates = newDates;
  }

  // async function fetchdata() {
  //   invalidateAll();
  //   // console.log(data.seedBank.plantsInSeedbank);
  //   yourPlant =
  //     data.seedBank.plantsInSeedbank.find(
  //       (plant) => plant.plant.parent1 == null && plant.plant.parent2 == null
  //     )?.plant || null;
  // }

  onMount(() => {
    const datesInterval = setInterval(updateDates, 1000);
    // const databaseInterval = setInterval(fetchdata, 1000);
    return () => {
      clearInterval(datesInterval);
      // clearInterval(databaseInterval);
    };
  });
</script>

<div class="mx-12 font-inter text-roel_blue text-left">
  {#each data.seedBank.plantsInSeedbank as plant, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->

    {#if dates[index] > 5 || plant.plant == yourPlant}
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
          data-umami-event="Start Pollinating Button"
          class="bg-roel_green text-roel_blue font-inter text-xl px-4 py-2 mb-5 border-2 w-11/12 max-w-xs border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green"
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
          class="bg-roel_green text-roel_blue font-inter text-xl px-4 py-2 border-2 w-11/12 max-w-xs border-roel_blue rounded-full text-opacity-50 border-opacity-50"
        >
          Fertile in {convertMinutesToMinutesAndSeconds(5 - dates[index])}
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
    isOriginalPlant={selectedPlant.id == yourPlant?.id}
    isPollinatingPlant={Math.abs(
      moment().diff(moment(selectedPlant.created), "minutes")
    ) > 5}
  ></PopupInfo>
{/if}

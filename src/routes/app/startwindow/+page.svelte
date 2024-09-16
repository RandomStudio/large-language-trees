<script lang="ts">
  import { goto } from "$app/navigation";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import ButtonBottom from "$lib/shared-components/ButtonBottom.svelte";

  enum Stage {
    WELCOME_FIRST_PLANT,
    NOW_FIND
  }

  let currentStage = Stage.WELCOME_FIRST_PLANT;

  export let data;
</script>

<div class="bg-roel_blue rounded-b-full">
  <div class="font-primer text-roel_green text-left pt-[68px]">
    {#if currentStage === Stage.WELCOME_FIRST_PLANT}
      <p class="mx-10 text-2xl -mb-5" data-test="welcome-text">
        Dear digital gardener, here is your first plant!
      </p>
    {:else}
      <p class="mx-10 text-2xl -mb-5" data-test="welcome-text">
        Now find a fellow gardener in the studio and scan their barcode to start
        pollinating.
      </p>
    {/if}
    <div class="mx-auto mt-3 w-64">
      <PlantDisplay imageUrl={data.startPlant.plant.imageUrl || ""}
      ></PlantDisplay>
    </div>
  </div>
</div>
<div class="mx-10 font-primer text-roel_blue mb-[130px]">
  <div>
    <div>
      {#if currentStage === Stage.WELCOME_FIRST_PLANT}
        <p class="text-3xl mt-4 text-center">
          {data.startPlant.plant.commonName}
        </p>
        <p class="text-base mt-3">
          {data.startPlant.plant.description}
        </p>
      {/if}
    </div>
  </div>
  <div class="mt-4">
    <ButtonBottom
      text={currentStage === Stage.WELCOME_FIRST_PLANT
        ? "Great!"
        : "Start Pollinating"}
      onClick={() => {
        if (currentStage === Stage.WELCOME_FIRST_PLANT) {
          currentStage = Stage.NOW_FIND;
        } else {
          goto(`/app/gallery/scan/${data.startPlant.plant.id}`); // Navigate to the pollination route
        }
      }}
    />
  </div>
</div>

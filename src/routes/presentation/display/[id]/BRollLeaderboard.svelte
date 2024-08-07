<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "./DisplayGarden.svelte";
  export let topPollinators;
  export let topGarden: GardenWithPlants;
</script>

<body class="bg-roel_purple h-screen flex flex-col justify-end">
  <div
    class="w-full h-[230px] flex items-center text-left pl-5 text-roel_purple text-7xl font-jeanb bg-roel_rose"
  >
    MOST ACTIVE
    <br />POLLINATORS:
  </div>

  <DisplayGarden
    garden={topGarden}
    xGarden={-100}
    yGarden={0}
    width={740}
    height={740}
    showGardenName={true}
    showPlantName={false}
    colorBGText={"roel_rose"}
  ></DisplayGarden>

  {#each topPollinators as userInfo, index}
    <div
      class="w-full h-[80px] flex items-center justify-between px-5 {index %
        2 ===
      0
        ? 'bg-roel_purple'
        : 'bg-roel_rose'}"
    >
      <div
        class="text-4xl font-primer {index % 2 === 0
          ? 'text-roel_rose'
          : 'text-roel_purple'}"
      >
        {userInfo.username}
      </div>
      <div
        class="text-4xl font-primer {index % 2 === 0
          ? 'text-roel_rose'
          : 'text-roel_purple'}"
      >
        x {userInfo.count}
      </div>
    </div>
  {/each}
</body>

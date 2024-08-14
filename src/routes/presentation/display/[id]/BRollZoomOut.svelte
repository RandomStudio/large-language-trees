<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "./DisplayGarden.svelte";

  export let userName: string;
  export let garden: GardenWithPlants;
</script>

<body class="bg-roel_purple w-full h-screen relative overflow-hidden">
  <div
    class="bg-roel_rose w-full h-[250px] flex text-center text-roel_purple items-center justify-center text-7xl font-jeanb"
  >
    {userName}'s <br /> GARDEN
  </div>

  <DisplayGarden
    {garden}
    xGarden={0}
    yGarden={500}
    height={540}
    width={540}
    showGardenName={false}
    showPlantName={true}
    colorBGText="roel_rose"
    innerwidth={window.innerWidth}
    innerheight={window.innerHeight}
  ></DisplayGarden>

  <div
    class="w-full flex text-left items-left left-[90px] justify-start absolute bottom-[20px] text-roel_rose text-4xl font-primer"
  >
    Join the Garden!
  </div>
</body>

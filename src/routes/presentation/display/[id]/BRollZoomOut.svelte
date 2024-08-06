<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";
  import DisplayGarden from "./DisplayGarden.svelte";

  export let userName: string;
  export let garden: GardenWithPlants;
</script>

<body class="bg-roel_purple min-h-screen">
  <div
    class="bg-roel_rose w-full h-[250px] flex text-center text-roel_purple items-center justify-center text-6xl font-jeanb"
  >
    {userName}'s <br /> GARDEN
  </div>

  <DisplayGarden
    {garden}
    xGarden={-100}
    yGarden={500}
    height={740}
    width={740}
    showGardenName={false}
    showPlantName={true}
    colorBGText="roel_rose"
  ></DisplayGarden>

  <div class="fixed bottom-5 left-40 text-roel_rose text-4xl font-primer">
    Join the Garden!
  </div>
  <div class="fixed left-5 bottom-5 w-28 h-auto">
    <img
      src="/livinggarden_QR_purple_green.png"
      alt="Barcode"
      class="w-full h-auto"
    />
  </div>
</body>

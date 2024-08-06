<script lang="ts">
  import type { DisplayMultipleGardens } from "$lib/events.types";
  import DisplayGarden from "./DisplayGarden.svelte";
  export let gardens: DisplayMultipleGardens;
</script>

<body class="relative bg-roel_purple min-h-screen">
  <DisplayGarden
    xGarden={0}
    yGarden={0}
    height={350}
    width={350}
    garden={gardens.contents[0].garden}
    showGardenName={true}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={190}
    yGarden={300}
    height={350}
    width={350}
    garden={gardens.contents[1].garden}
    showGardenName={true}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={0}
    yGarden={600}
    height={350}
    width={350}
    garden={gardens.contents[2].garden}
    showGardenName={true}
  ></DisplayGarden>
  <DisplayGarden
    xGarden={190}
    yGarden={900}
    height={350}
    width={350}
    garden={gardens.contents[3].garden}
    showGardenName={true}
  ></DisplayGarden>

  <div class="fixed bottom-5 left-40 text-roel_green text-4xl font-primer">
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

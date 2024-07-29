<script>
  import DisplayGarden from "./DisplayGarden.svelte";
  import { garden } from "./gardenExample.js";
</script>

<body class="relative bg-roel_purple min-h-screen">
  <DisplayGarden xGarden={0} yGarden={0} height={300} width={230} {garden}
  ></DisplayGarden>
  <DisplayGarden xGarden={280} yGarden={320} height={300} width={200} {garden}
  ></DisplayGarden>
  <DisplayGarden xGarden={0} yGarden={640} height={300} width={200} {garden}
  ></DisplayGarden>
  <DisplayGarden xGarden={280} yGarden={960} height={300} width={200} {garden}
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

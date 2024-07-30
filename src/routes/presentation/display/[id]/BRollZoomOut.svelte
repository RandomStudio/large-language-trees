<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";
  export let userName: string;
</script>

<body class="bg-roel_purple">
  <div
    class="w-full h-[350px] flex text-center items-center justify-center text-roel_purple text-7xl font-jeanb bg-roel_rose"
  >
    {userName}'s <br /> GARDEN
  </div>
  <div
    class="absolute bottom-5 w-full flex justify-center text-roel_rose text-4xl font-primer"
  >
    Join the Garden!
  </div>
</body>

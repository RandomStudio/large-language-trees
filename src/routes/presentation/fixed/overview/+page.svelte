<script lang="ts">
  import DisplayGarden from "../../shared-components/DisplayGarden.svelte";

  export let data;
</script>

<div
  class="w-full h-full flex items-center justify-center presentation-gradient"
>
  <div
    class="w-full text-center text-roel_yellow text-4xl font-gyst absolute top-32 z-10 uppercase"
  >
    Bird's Eye View
  </div>
  <DisplayGarden
    width={520}
    height={800}
    garden={data.gardenWithPlants}
    ignoreOriginal={true}
    showGardenName={false}
  />
</div>

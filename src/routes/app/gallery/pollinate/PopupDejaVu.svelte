<script lang="ts">
  import type { SelectPlant } from "$lib/types";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";
  import Cta from "../../components/Cta.svelte";

  export let plantDetails: SelectPlant;

  export let handleClose: () => void;
</script>

<div class="fixed top-0 left-0 bg-roel_green w-screen h-screen overflow-scroll">
  <div class="mx-10 font-gyst text-roel_blue text-left my-8">
    <p class="text-xl">Whoops! C'est un déjà-vu!</p>
    <div class="mt-4">
      <PlantDisplay
        imageUrl={plantDetails.imageUrl || ""}
        label={plantDetails.commonName}
        applyFilters={false}
      />
      <Cta onClick={handleClose}>OK</Cta>
    </div>
  </div>
</div>

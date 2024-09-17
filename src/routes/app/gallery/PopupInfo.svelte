<script lang="ts">
  import { goto } from "$app/navigation";
  import type { SelectPlant } from "$lib/types";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";
  import Layout from "../components/Layout.svelte";

  export let plantDetails: SelectPlant;
  export let closePopup: () => any;
</script>

<ReturnButton onClick={closePopup} />

<div class="fixed z-20 top-0 left-0 h-full overflow-auto bg-roel_green pb-32">
  <Layout title={undefined}>
    <div class="text-new_purple">
      <div class="mb-12">
        <PlantDisplay
          imageUrl={plantDetails.imageUrl || ""}
          applyFilters={false}
          label={plantDetails.commonName}
          description={plantDetails.description}
        />
      </div>
    </div>
  </Layout>
</div>

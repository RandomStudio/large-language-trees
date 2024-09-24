<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PublicUserInfo, SelectPlant } from "$lib/types";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";
  import Layout from "../components/Layout.svelte";
  import { onMount } from "svelte";

  export let plantDetails: SelectPlant;
  export let authorTopUser: PublicUserInfo | null = null;
  export let authorBottomUser: PublicUserInfo | null = null;
  export let closePopup: () => any;
  export let isOriginalPlant: boolean = false;

  onMount(() => {
    console.log("got info", { plantDetails, authorTopUser, authorBottomUser });
  });
</script>

<ReturnButton onClick={closePopup} />

<div class="fixed z-20 top-0 left-0 h-full overflow-auto bg-roel_green pb-32">
  <Layout title={undefined}>
    <div class="text-new_purple">
      <div class="mb-12">
        <PlantDisplay
          imageUrl={plantDetails.imageUrl || ""}
          applyFilters={false}
          label={isOriginalPlant
            ? `Your ${plantDetails.commonName}`
            : plantDetails.commonName}
          description={plantDetails.description}
          {authorTopUser}
          {authorBottomUser}
        />
      </div>
    </div>
  </Layout>
</div>

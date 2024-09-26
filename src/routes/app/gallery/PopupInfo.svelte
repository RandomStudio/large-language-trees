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
  export let parentTopPlant: string | null = null;
  export let parentBottomPlant: string | null = null;

  export let closePopup: () => any;
  export let isOriginalPlant: boolean = false;

  onMount(() => {
    console.log("got info", {
      plantDetails,
      authorTopUser,
      authorBottomUser,
      parentTopPlant,
      parentBottomPlant
    });
  });
</script>

<ReturnButton onClick={closePopup} />

<div class="fixed z-20 top-0 left-0 h-full overflow-auto bg-roel_green pb-32">
  <Layout title={undefined}>
    <div>
      <div class="text-roel_green text-center text-large">
        {isOriginalPlant ? "Your " : ""}
        {plantDetails.commonName}
      </div>
      {#if parentTopPlant && parentBottomPlant}
        <p class="text-roel_green text-sm text-center capitalize">
          ({parentTopPlant} x {parentBottomPlant})
        </p>
      {/if}

      <div class="my-4">
        <PlantDisplay
          imageUrl={plantDetails.imageUrl || ""}
          applyFilters={false}
        />
      </div>
      <div class="text-new_purple">
        {plantDetails.description}
      </div>
    </div>
  </Layout>
</div>

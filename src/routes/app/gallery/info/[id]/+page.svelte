<script lang="ts">
  import { goto } from "$app/navigation";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";
  import Layout from "../../../components/Layout.svelte";

  export let data;

  // export let plantDetails: SelectPlant;
  // export let authorTopUser: PublicUserInfo | null = null;
  // export let authorBottomUser: PublicUserInfo | null = null;
  // export let parentTopPlant: string | null = null;
  // export let parentBottomPlant: string | null = null;

  export let isOriginalPlant: boolean = false;
</script>

<ReturnButton
  onClick={() => {
    goto("/app/gallery");
  }}
/>

<Layout title={undefined}>
  <div>
    <div class="text-roel_green text-center text-large -mt-4">
      {isOriginalPlant ? "Your " : ""}
      {data.commonName}
    </div>
    {#if data.parentPlantTop && data.parentPlantBottom}
      <p class="text-roel_green text-sm text-center capitalize">
        ({data.parentPlantTop.commonName} x {data.parentPlantBottom.commonName})
      </p>
    {/if}

    <div class="my-4">
      <PlantDisplay
        authorTopUser={data.authorTopUser}
        authorBottomUser={data.authorBottomUser}
        imageUrl={data.imageUrl || ""}
        applyFilters={false}
      />
    </div>
    <div class="text-new_purple text-small text-center">
      {data.description}
    </div>
  </div>
</Layout>

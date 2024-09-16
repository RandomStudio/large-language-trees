<script lang="ts">
  import { goto } from "$app/navigation";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import ButtonBottom from "$lib/shared-components/ButtonBottom.svelte";
  import Layout from "../components/Layout.svelte";

  export let data;
</script>

<Layout title="Let's Pollinate">
  <div class="font-primer text-roel_blue mb-[200px]">
    <div class="font-primer text-roel_green text-left">
      <p class="text-medium" data-test="welcome-text">
        Here is your first plant!
      </p>
      <div class="mx-auto pt-12 w-64">
        <PlantDisplay imageUrl={data.startPlant.plant.imageUrl || ""}
        ></PlantDisplay>
      </div>
    </div>
    <p class="text-large text-center mb-8">
      {data.startPlant.plant.commonName}
    </p>
    <p class="text-small text-left">
      Now find a fellow gardener and scan their QR code to start pollinating.
    </p>
    <ButtonBottom
      text="Start Pollinating"
      onClick={() => goto(`/app/gallery/scan/${data.startPlant.plant.id}`)}
    />
  </div>
</Layout>

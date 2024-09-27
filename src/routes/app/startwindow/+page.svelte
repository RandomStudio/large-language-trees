<script lang="ts">
  import { goto } from "$app/navigation";
  import PlantDisplay from "$lib/shared-components/PlantDisplay.svelte";
  import Layout from "../components/Layout.svelte";
  import Cta from "../components/Cta.svelte";

  export let data;
</script>

<Layout hasScroll title="Let's Pollinate">
  <div
    class="font-primer text-roel_blue grid grid-rows-[max-content_1fr_max-content_1fr_max-content]"
  >
    <p class="text-medium text-roel_green" data-test="welcome-text">
      Here is your plant!
    </p>
    <div />
    <div>
      <div class="w-full">
        <PlantDisplay imageUrl={data.startPlant.plant.imageUrl || ""}
        ></PlantDisplay>
      </div>
      <p class="text-large text-center mb-8">
        {data.startPlant.plant.commonName}
      </p>
    </div>
    <div />
    <p class="text-small text-left">
      Now find a fellow gardener and scan their QR code to start pollinating.
    </p>
    <Cta
      umami="Start Pollinating"
      onClick={() => goto(`/app/gallery/scan/${data.startPlant.plant.id}`)}
      >Start Pollinating</Cta
    >
  </div>
</Layout>

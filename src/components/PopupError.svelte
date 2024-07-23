<script lang="ts">
  import type { InsertPlant } from "$lib/types";

  import ButtonBottom from "./ButtonBottom.svelte";
  import ConfirmBreedPopup from "../routes/app/gallery/pollination/[id]/ConfirmBreedPopup.svelte";

  export let candidateChild: InsertPlant;

  export let onCancel: () => any;
  export let onConfirm: (plantReadyToAdd: InsertPlant) => Promise<void>;

  let display: boolean = true;
</script>

<div
  class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-roel_green z-50"
>
  <div class="flex flex-col items-center">
    <div
      id="message"
      class="text-roel_blue font-inter text-xl mt-4 text-center"
    >
      A bird came and took away the seed
    </div>
    <ButtonBottom buttonText="Try again" functionClick={() => (display = false)}
    ></ButtonBottom>
  </div>
</div>

{#if !display}
  <ConfirmBreedPopup {candidateChild} {onCancel} {onConfirm}
  ></ConfirmBreedPopup>
{/if}

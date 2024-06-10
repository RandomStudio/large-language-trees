<script lang="ts">
  import { stringify } from "postcss";

  export let buttonText: string;
  export let functionClick;
  export let pxSize: string = "px-0";
</script>

<div class="fixed bottom-8 left-0 right-0 text-center {pxSize}">
  <button
    class="bg-roel_green text-roel_blue font-inter text-xl px-4 py-2 border-2 w-11/12 max-w-xs border-roel_blue rounded-full"
    on:click={functionClick()}
  >
    {buttonText}
  </button>
</div>

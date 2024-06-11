<script lang="ts">
  import { stringify } from "postcss";

  export let buttonText: string;
  export let functionClick;
  export let width: string = "w-11/12";
</script>

<div
  class="fixed left-0 right-0 bottom-8 flex items-center justify-center mx-12 z-50"
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <button
    class=" {width} max-w-xs text-roel_blue bg-roel_green text-xl font-inter border-2 border-roel_blue rounded-full px-4 py-2"
    on:click={functionClick}
  >
    {buttonText}
  </button>
</div>

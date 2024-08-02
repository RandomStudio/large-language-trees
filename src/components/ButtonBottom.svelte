<script lang="ts">
  export let buttonText: string;
  export let functionClick;
  export let width: string = "w-11/12";
</script>

<div
  class="fixed left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-gradient-to-t from-roel_green/100 from-25% to-roel_green/0"
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <button
    data-umami-event={buttonText + " Button"}
    class=" {width} max-w-xs text-roel_green bg-roel_blue border-[3px] mt-10 font-primer text-3xl px-4 py-[0.5rem] border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green mx-16 mb-5"
    on:click={functionClick}
  >
    {buttonText}
  </button>
</div>

<script lang="ts">
  import { onMount } from "svelte";

  export let onClick: () => void;
  export let umami: string | undefined = undefined;
  export let test: string | undefined = undefined;

  let button: HTMLButtonElement;

  onMount(() => {
    button.addEventListener("touchstart", function () {
      this.classList.add("touch-active");
    });

    button.addEventListener("touchend", function () {
      this.classList.remove("touch-active");
    });
  });
</script>

<div class="fixed bottom-0 left-10 right-10 content-center">
  <button
    bind:this={button}
    on:click={onClick}
    data-test={test}
    data-umami-event={umami}
    class="w-full bg-roel_blue text-roel_green font-primer text-3xl px-4 py-[0.5rem] mb-5 border-2 border-roel_blue rounded-full button-with-active"
  >
    <slot />
  </button>
</div>

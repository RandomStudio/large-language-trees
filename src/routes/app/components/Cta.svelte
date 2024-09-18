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

<div class="fixed bottom-0 left-10 right-10 content-center buttonContainer">
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

<style>
  :global(.hasScroll) .buttonContainer::before {
    position: absolute;
    left: -40px;
    right: -40px;
    top: -100px;
    bottom: 100%;
    z-index: -1;
    background-color: red;
    background: linear-gradient(
      180deg,
      rgba(200, 245, 143, 0) 0%,
      rgba(200, 245, 143, 1) 100%
    );
    content: "";
  }
  :global(.hasScroll) .buttonContainer::after {
    position: absolute;
    left: -40px;
    right: -40px;
    top: 0;
    bottom: -40px;
    z-index: -1;
    background-color: rgba(200, 245, 143, 1);
    content: "";
  }
</style>

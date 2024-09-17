<script lang="ts">
  export let onClick: () => void;
  export let umami: string | undefined = undefined;
  export let test: string | undefined = undefined;
</script>

<div class="fixed bottom-0 left-10 right-10 content-center">
  <button
    on:click={onClick}
    data-test={test}
    data-umami-event={umami}
    class="w-full bg-roel_blue text-roel_green font-primer text-3xl px-4 py-[0.5rem] mb-5 border-2 border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green"
  >
    <slot />
  </button>
</div>

<script>
  export let onClick;
  export let emptyBackground = false;
</script>

<button
  class="fixed top-4 right-4 z-30 text-roel_green font-primer flex items-center justify-center w-10 h-10 border-[2px] rounded-full active:bg-roel_purple active:text-roel_green"
  class:bg-roel_purple={!emptyBackground}
  class:border-roel_green={!emptyBackground}
  class:border-roel_purple={emptyBackground}
  on:click={onClick}
>
  <slot />
</button>

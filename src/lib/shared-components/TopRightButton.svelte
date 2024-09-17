<script>
  export let onClick;
</script>

<button
  class="fixed top-3 right-6 z-30 text-roel_green font-primer flex bg-transparent items-center justify-center w-10 h-10 border-[2px] border-roel_green rounded-full active:bg-roel_blue active:text-roel_green"
  on:click={onClick}
>
  <slot />
</button>

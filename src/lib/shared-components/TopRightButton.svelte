<script>
  export let onClick;
</script>

<button
  class="fixed top-7 right-4 z-30 text-roel_green font-primer flex bg-new_purple items-center justify-center w-10 h-10 border-[2px] border-roel_green rounded-full active:bg-roel_blue active:text-roel_green"
  on:click={onClick}
>
  <slot />
</button>

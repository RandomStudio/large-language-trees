<script>
  export let functionReturn;
</script>

<button
  class="fixed top-3 right-6 z-30 text-roel_blue flex bg-roel_green items-center justify-center w-10 h-10 border-[3px] border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green"
  on:click={functionReturn}
>
  <svg
    class="w-6 h-6 text-roel_blue scale-125"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M15 19l-7-7 7-7" />
  </svg>
</button>

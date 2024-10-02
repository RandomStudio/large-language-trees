<script>
  import TopRightButton from "./TopRightButton.svelte";

  export let onClick;
  export let emptyBackground = false;
</script>

<TopRightButton {onClick} {emptyBackground}>
  <svg
    class="w-6 h-6 text-roel_green scale-125"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
    stroke={emptyBackground ? "#4B0082" : "currentColor"}
  >
    <path d="M15 19l-7-7 7-7" />
  </svg>
</TopRightButton>

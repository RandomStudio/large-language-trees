<script lang="ts">
  import Cta from "../../components/Cta.svelte";

  export let onClick: () => void;
  export let errorText: string;
</script>

<div
  class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-roel_green z-50"
>
  <div class="flex flex-col items-center">
    <div
      id="message"
      class="text-roel_purple font-inter text-xl mt-4 text-center"
    >
      {errorText}
    </div>
    <Cta umami="PopupError" {onClick}>Try Again</Cta>
  </div>
</div>

<script lang="ts">
  import "../../index.css";

  import { page } from "$app/stores";
  import AudioPlayer from "./AudioPlayer.svelte";

  const isFixed = $page.url.searchParams.has("fixed");
</script>

<div
  class="fixed top-0 left-0"
  class:fixed-size={isFixed}
  class:w-screen={!isFixed}
  class:h-screen={!isFixed}
  class:presentation-gradient={!isFixed}
>
  <slot />

  <AudioPlayer debug={true} />
</div>

<style>
  .fixed-size {
    width: 540px;
    height: 1620px;
  }
</style>

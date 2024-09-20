<script lang="ts">
  import "../../index.css";

  import { page } from "$app/stores";

  const isFixed = $page.url.searchParams.has("fixed");
</script>

<div class:fixed-size={isFixed}>
  <slot />
</div>

<style>
  .fixed-size {
    width: 540px;
    height: 1620px;
  }
</style>

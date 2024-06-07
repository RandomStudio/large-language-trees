<script>
  import "../app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="min-h-screen bg-roel_green relative">
  <div class="fixed top-5 left-5 p-2">
    {#if $page.url.pathname !== "/info" && $page.url.pathname !== "/"}
      <h1
        class="text-xl text-roel_blue cursor-pointer font-garamond"
        on:click={() => {
          goto("/info");
        }}
      >
        The Garden
      </h1>
    {/if}
  </div>

  <div class="app pt-20">
    <slot />
  </div>
</div>

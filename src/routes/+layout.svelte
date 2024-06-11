<script>
  import "../app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
</script>

<div class="bg-roel_green w-screen h-screen fixed"></div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="min-h-screen bg-roel_green absolute">
  {#if $page.url.pathname !== "/info" && $page.url.pathname !== "/"}
    <div class="fixed w-full z-30 bg-roel_green pt-8 pl-8">
      <h1
        class="text-xl text-roel_blue cursor-pointer font-garamond"
        on:click={() => {
          goto("/info");
        }}
      >
        The Garden
      </h1>
    </div>
  {/if}

  <!-- Ajustez le padding au lieu de la marge pour commencer le contenu en dessous de l'en-tête -->
  <div class="app">
    {#if $page.url.pathname !== "/info" && $page.url.pathname !== "/"}
      <div class="pt-20"></div>
    {/if}
    <slot />
  </div>
</div>

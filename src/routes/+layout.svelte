<script>
  import "../app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
</script>

<script defer src="https://cloud.umami.is/script.js" data-website-id="1aa1e332-894f-4504-9e6c-f3f88265ffe3"></script>

<div class="bg-roel_green w-screen h-screen fixed"></div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="min-h-screen bg-roel_green absolute">
  {#if $page.url.pathname !== "/info" && $page.url.pathname !== "/" && $page.url.pathname !== "/garden"}
    <div class="fixed w-full z-30 bg-roel_green pt-8 pl-8">
      <h1 class="text-xl text-roel_blue font-garamond">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          class="cursor-pointer"
          on:click={() => {
            goto("/info");
          }}
        >
          The Garden
        </span>
      </h1>
    </div>
  {/if}

  <!-- Adjust padding instead of margin to start content below the header -->
  <div class="app">
    {#if $page.url.pathname !== "/info" && $page.url.pathname !== "/" && $page.url.pathname !== "/garden"}
      <div class="pt-20"></div>
    {/if}
    <slot />
  </div>
</div>

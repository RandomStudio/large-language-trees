<script>
  import "./app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { derived } from "svelte/store";
  import { or } from "drizzle-orm";

  const isPollinationPage = derived(page, ($page) => {
    return $page.url.pathname.includes("/pollination");
  });
</script>

<div class="bg-roel_green w-screen h-screen fixed"></div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="z-20 min-h-screen bg-roel_green absolute">
  {#if $page.url.pathname !== "/app/info" && $page.url.pathname !== "/app" && $page.url.pathname !== "/app/garden" && $page.url.pathname !== "/app/startwindow" && $page.url.pathname !== "/app/gallery/pollination/baobab"}
    <div class="fixed w-full z-30 pt-3 pl-8">
      <h1 class="text-3xl text-roel_blue font-jeanb">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          class="cursor-pointer"
          on:click={() => {
            goto("info");
          }}
        >
          Let's Pollinate
        </span>
      </h1>
    </div>
  {/if}
  {#if $page.url.pathname == "/app/startwindow" || $isPollinationPage}
    <div class="fixed w-full z-30 pt-3 pl-8">
      <h1 class="text-3xl text-roel_green font-jeanb">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          class="cursor-pointer"
          on:click={() => {
            goto("/app/info");
          }}
        >
          Let's Pollinate
        </span>
      </h1>
    </div>
  {/if}

  <!-- Adjust padding instead of margin to start content below the header -->
  <div class="app">
    {#if $page.url.pathname !== "/app/info" && $page.url.pathname !== "/app/" && $page.url.pathname !== "/app/garden"}
      <div class="pt-0"></div>
    {/if}
    <slot />
  </div>
</div>

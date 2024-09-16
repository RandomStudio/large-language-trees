<script>
  import "./app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { derived } from "svelte/store";
  import { or } from "drizzle-orm";

  const isPollinationPage = derived(page, ($page) => {
    return $page.url.pathname.includes("/pollination");
  });

  const isFullPage =
    $page.url.pathname === "/app" || $page.url.pathname.includes("admin");
</script>

<svelte:head>
  {#if $page.url.pathname == "/app/startwindow" || $isPollinationPage}
    <meta name="theme-color" content="#670093" />
  {:else}
    <meta name="theme-color" content="#C8F58F" />
  {/if}
</svelte:head>

<slot />

<style scoped>
  .pageWrapper {
    position: fixed;
    inset: 0;
    overflow: auto;
  }
</style>

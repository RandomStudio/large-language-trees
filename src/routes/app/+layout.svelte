<script>
  import "./app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { derived } from "svelte/store";
  import { or } from "drizzle-orm";
  import { fade } from "svelte/transition";
  import transitionClasses from "svelte-transition-classes";

  export let data;

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

{#key data.pathname}
  <div
    class="font-primer max-h-screen overflow-auto"
    in:transitionClasses={{
      duration: 300,
      delay: 400,
      base: "transition transition-in-base",
      from: "transition transition-in-from",
      to: "transition transition-in-to"
    }}
    out:transitionClasses={{
      duration: 300,
      base: "transition transition-out-base",
      from: "transition transition-out-from",
      to: "transition transition-out-to"
    }}
  >
    <slot />
  </div>
{/key}

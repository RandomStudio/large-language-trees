<script>
  import "../../index.css";
  import { page } from "$app/stores";
  import { derived } from "svelte/store";
  import transitionClasses from "svelte-transition-classes";

  export let data;

  const isPollinationPage = derived(page, ($page) => {
    return $page.url.pathname.includes("/pollination");
  });

  const isFullPage =
    $page.url.pathname === "/app" || $page.url.pathname.includes("admin");
</script>

<svelte:head>
  {#if $page.url.pathname === "/"}
    <meta name="theme-color" content="#C8F58F" />
  {:else}
    <meta name="theme-color" content="#4B0082" />
  {/if}
</svelte:head>

{#key data.pathname}
  <div
    class="font-primer overflow-auto pageWrapper fixed top-0 left-0 right-0 h-dvh"
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

<style scoped>
  .pageWrapper {
    overscroll-behavior-y: none;
  }
</style>

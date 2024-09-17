<script lang="ts">
  export let isFullPage = false;
  export let title: string | undefined = undefined;
</script>

<div class="min-h-screen max-w-screen pageWrapper flex flex-col text-small">
  <!-- used for transitions. See route +layout.svelte and app.css-->
  {#if isFullPage}
    <div class="page-contents">
      <slot />
    </div>
  {:else}
    <div class="standard-gradient px-10">
      <div class="page-contents">
        <header class="py-4">
          {#if title}
            <h1 class="text-xl text-roel_green font-gyst">{title}</h1>
          {/if}
        </header>
        <div>
          <slot />
        </div>
      </div>
    </div>
  {/if}
</div>

<style scoped>
  .pageWrapper {
    position: fixed;
    inset: 0;
    overflow: auto;
  }
</style>

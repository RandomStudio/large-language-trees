<script lang="ts">
  export let hasScroll = false;
  export let isFullPage = false;
  export let title: string | undefined = undefined;
</script>

<div class="min-h-full w-full flex flex-row text-small">
  <!-- used for transitions. See route +layout.svelte and app.css-->
  {#if isFullPage}
    <div class="page-contents">
      <slot />
    </div>
  {:else}
    <div class="standard-gradient px-10">
      <div
        class="page-contents h-full grid gridWrapper {hasScroll && 'hasScroll'}"
      >
        <header class="py-4">
          {#if title}
            <h1
              class="text-xl text-roel_green font-gyst leading-tight font-semibold"
            >
              {title}
            </h1>
          {/if}
        </header>
        <slot />
        <!-- cta padding -->
        <div />
      </div>
    </div>
  {/if}
</div>

<style scoped>
  .gridWrapper {
    grid-template-rows: max-content auto 100px;
  }
  .gridWrapper:global(.hasScroll) {
    grid-template-rows: max-content auto 180px;
  }
</style>

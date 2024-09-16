<script lang="ts">
  export let isFullPage = false;
  export let title: string | undefined = undefined;
</script>

<div
  class="min-h-screen max-w-screen pageWrapper bg-roel_green flex flex-col text-small"
>
  {#if isFullPage}
    <slot />
  {:else}
    <div class="standard-gradient px-10">
      <header class="pt-4 pb-11">
        <h1 class="text-xl text-roel_green font-gyst">{title}</h1>
      </header>
      <div>
        <slot />
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

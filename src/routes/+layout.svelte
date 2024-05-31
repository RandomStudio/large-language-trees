<script>
  import "../app.css";
  import { goto } from "$app/navigation";
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="min-h-screen bg-roel_green relative">
  <div class="fixed top-10 left-10 p-2">
    <h1
      class="text-3xl text-roel_blue cursor-pointer"
      on:click={() => {
        goto("/info");
      }}
    >
      The Garden
    </h1>
  </div>

  <div class="app pt-20">
    <slot />
  </div>
</div>

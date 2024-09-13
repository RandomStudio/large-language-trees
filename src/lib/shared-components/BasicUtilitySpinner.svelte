<script lang="ts">
  export let message: string | null = null;
</script>

<div
  class="fixed top-16 left-o m-0 w-screen text-center bg-slate-500 bg-opacity-50"
>
  <div class="spinner centre">🌼</div>
  {#if message}
    <div class="text-center text-white">
      {message}
    </div>
  {/if}
</div>

<style>
  .spinner {
    animation: spinner 5s linear infinite;
    font-size: 4em;
  }

  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }
</style>

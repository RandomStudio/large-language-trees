<script lang="ts">
  import { playRandomGrow } from "./AudioEngine";

  export let debug = false;

  const testGrowSound = () => {
    playRandomGrow();
  };
</script>

<div class="fixed top-32 left-0 z-50">
  <div class:hidden={!debug}>
    <button
      class="border-2 border-purple-900 rounded-lg p-4"
      on:click={testGrowSound}>Random</button
    >
  </div>
</div>

<script lang="ts">
  import { playRandomGrow, startAmbience, stopAmbience } from "./AudioEngine";

  export let debug = false;

  const testGrowSound = () => {
    playRandomGrow();
  };
</script>

<div class="fixed top-64 left-32 z-50">
  <div class:hidden={!debug}>
    <div>
      FX
      <button
        class="border-2 border-purple-900 rounded-lg p-4"
        on:click={testGrowSound}>Random</button
      >
    </div>
    <div>
      Ambience
      <button
        class="border-2 border-purple-900 rounded-lg p-4"
        on:click={startAmbience}>Start</button
      >
      <button
        class="border-2 border-purple-900 rounded-lg p-4"
        on:click={stopAmbience}>Stop</button
      >
    </div>
  </div>
</div>

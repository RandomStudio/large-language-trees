<script lang="ts">
  function goBack() {
    window.history.back();
  }
</script>

<div
  class="relative flex items-start justify-center min-h-screen bg-roel_green font-inter text-sm"
>
  <button class="fixed top-5 right-10 text-roel_blue" on:click={goBack}>
    ✕
  </button>
  <main class="mx-14 w-full max-w-4xl pt-16">
    <!-- Padding top ajouté ici -->
    <div class="flex justify-center">
      <canvas id="canvas" style="display:none;"></canvas>
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img src="/titleimg.png" alt="logo" style="display:block;" />
    </div>

    <div class="text-left">
      <p class="text-roel_blue">
        Welcome to Randoms Lucullan Gardenia, the exclusive greenhouse,
        sprouting digital abundance. <br /><br />
        Find other Gardeners in the studio to start cross-pollinating and witness
        your sprouts flourish in our common garden.
      </p>
      <br />
      <div class="text-left">
        <span class="text-roel_blue font-semibold">Production:</span><br />
        <span class="text-roel_blue">Studio Random</span><br />
        <span class="text-roel_blue font-semibold">Image Data:</span><br />
        <span class="text-roel_blue">Chat GPT/ Open AI</span><br /><br />
      </div>
    </div>
  </main>
</div>

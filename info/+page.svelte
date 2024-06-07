<script lang="ts">
  function goBack() {
    window.history.back();
  }
</script>

<div
  class="absolute flex items-start justify-center min-h-screen bg-roel_green font-inter text-sm"
>
  <button
    class="fixed top-8 right-7 text-roel_blue flex items-center justify-center w-10 h-10 border-2 border-roel_blue rounded-full"
    on:click={goBack}
  >
    <svg
      class="w-6 h-6 text-roel_blue"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  <main class="mx-14 w-full max-w-4xl pt-16">
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

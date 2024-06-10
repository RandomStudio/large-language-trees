<script lang="ts">
  function goBack() {
    window.history.back();
  }
</script>

<button
  class="fixed top-8 right-7 z-50 text-roel_blue flex items-center justify-center w-10 h-10 border-2 border-roel_blue rounded-full"
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

<div class="mx-12 pt-32 font-inter text-left text-roel_blue text-sm">
  <img src="/titleimg.png" alt="logo" />
  <p class="mt-4">
    Welcome to Randoms Lucullan Gardenia, the exclusive greenhouse, sprouting
    digital abundance. <br /><br />
    Find other Gardeners in the studio to start cross-pollinating and witness your
    sprouts flourish in our common garden.
  </p>
  <br />
  <div>
    <span class="font-semibold">Production:</span><br />
    <span>Studio Random</span><br />
    <span class="font-semibold">Image Data:</span><br />
    <span>Chat GPT/ Open AI</span>
  </div>
</div>

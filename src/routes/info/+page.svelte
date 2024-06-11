<script lang="ts">
  import ReturnButton from "../../components/ReturnButton.svelte";

  function goBack() {
    window.history.back();
  }
</script>

<ReturnButton functionReturn={goBack}></ReturnButton>

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

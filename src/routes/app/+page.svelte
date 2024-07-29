<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  export let form: ActionData;

  let showButton = false;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    showButton = input.value.length > 0;
  }
</script>

<img src="FlowerDuo.png" class="absolute -z-10 opacity-100" alt="FlowerDuo" />
<div class="mx-10 pt-32 font-primer text-6xl text-roel_blue">
  <p class="font-jeanluc text-center">LET'S<br />POLLINATE</p>
  <div class="text-center">
    <form method="post" use:enhance class="mt-4 text-center max-w-md">
      <input
        class="bg-roel_green/75 border-[3px] border-roel_blue rounded-full text-roel_blue font-primer text-3xl px-4 py-[0.5rem] w-full max-w-xs placeholder-roel_blue placeholder:font-primer"
        type="text"
        id="username"
        name="username"
        placeholder="Fill in your name"
        on:input={handleInput}
      />
      <input
        class="bg-roel_green text-roel_blue py-2 px-4 border border-roel_blue rounded-full placeholder-roel_blue focus:outline-none focus:border-roel_blue mt-2 hidden w-11/12 max-w-xs"
        type="password"
        id="password"
        name="password"
        placeholder="Password"
        value="123456"
      />

      <button
        data-umami-event="Start button"
        class="text-roel_green bg-roel_blue font-primer text-3xl px-4 py-[0.5rem] mt-4 w-full max-w-xs border-[3px] border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green"
        type="submit"
      >
        Start
      </button>
    </form>
  </div>

  {#if form?.message}
    <div class="text-roel_blue text-left">
      Error: {form.message}
    </div>
  {/if}
</div>
<div
  class="font-primer text-left mt-32 text-base mx-0 text-roel_green bg-roel_blue"
>
  <div class="p-10">
    <p>
      Welcome to Random's synergistic Lusthof, where digital abundance is
      sprouting.
      <br />
      <br /> Find other Gardeners in the studio to start cross-pollinating and witness
      your sprouts flourish in our communal garden.
    </p>
    <br />
    <div>
      <span class="font-bold">Production:</span><br />
      <span>Studio Random</span><br />
      <span class="font-bold">Image Data:</span><br />
      <span>Chat GPT/ Open AI</span>
    </div>
  </div>
</div>

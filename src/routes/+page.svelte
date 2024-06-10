<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { ActionData } from "./$types";
  export let form: ActionData;

  let showButton = false;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    showButton = input.value.length > 0;
  }
</script>

<div class="mx-12 pt-32 font-inter">
  <img src="/titleimg.png" alt="logo" />
  <div class="text-center">
    <form method="post" use:enhance class="mt-0 text-center mx-auto max-w-md">
      <input
        class="bg-light_grey border-2 px-4 py-2 border-mid_grey rounded-full font-inter text-dark_grey text-xl w-11/12 max-w-xs placeholder-dark_grey placeholder:font-inter"
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
        class="text-roel_blue bg-roel_green font-inter text-xl px-4 py-2 mt-2 border-2 w-11/12 max-w-xs border-roel_blue rounded-full"
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

  <div class="text-left mt-4 text-sm text-roel_blue">
    <p>
      Welcome to the common garden of Lucullus. This Digital Common Garden is
      about connection and cross-pollination.<br /><br />
      Find other Gardeners to start cross-breeding and witness the offspring flourish
      in the common garden of Lucullus.
    </p>
    <br />
    <div>
      <span class="font-semibold">Production:</span><br />
      <span>Studio Random</span><br />
      <span class="font-semibold">Image Data:</span><br />
      <span>Chat GPT/ Open AI</span>
    </div>
  </div>
</div>

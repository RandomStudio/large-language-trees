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

<div
  class="flex items-center justify-center min-h-screen bg-roel_green overflow-hidden"
>
  <main class="mx-10 w-full max-w-4xl">
    <div class="flex justify-center space-x-4 my-8">
      <img src="/titleimg.png" alt="logo" />
    </div>

    <form
      method="post"
      use:enhance
      class="mt-8 text-center"
      style="min-height: 100px;"
    >
      <input
        class="bg-roel_green text-roel_blue py-2 px-4 border border-roel_blue rounded-full placeholder-roel_blue focus:outline-none focus:border-roel_blue"
        type="text"
        id="username"
        name="username"
        placeholder="Fill in your name"
        style="width:250px"
        on:input={handleInput}
      /><br />
      <input
        class="bg-roel_green text-roel_blue py-2 px-4 border border-roel_blue rounded-full placeholder-roel_blue focus:outline-none focus:border-roel_blue mt-2 hidden"
        type="password"
        id="password"
        name="password"
        placeholder="Password"
        style="width:250px"
        value="123456"
      /><br />
      <button
        class="bg-roel_green text-roel_blue font-semibold py-2 px-4 border-2 border-roel_blue rounded-full focus:outline-none focus:bg-transparent active:bg-transparent mt-2"
        style="width:250px;"
        type="submit"
      >
        Start
      </button>
    </form>

    {#if form?.message}
      <div class="text-roel_blue">
        Error: {form.message}
      </div>
    {/if}

    <div class="text-left mt-4">
      <p class="text-roel_blue">
        Welcome to the common garden of Lucullus. This Digital Common Garden is
        about connection and cross-pollination.<br /><br />
        Find other Gardeners to start cross-breeding and witness the offspring flourish
        in the common garden of Lucullus.
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

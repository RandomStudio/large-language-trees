<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let showButton = false;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    showButton = input.value.length > 0;
  }
</script>

<div
  class="flex items-center justify-center min-h-screen bg-green-300 overflow-hidden"
>
  <main class="text-left mx-1.5">
    <h1 class="text-3xl font-bold text-blue-600">The Garden</h1>

    <div>
      <div class="flex justify-center space-x-4">
        <img class="size-24" src="/plants/Gardenia.webp" alt="!" />
      </div>
      <form class="text-center">
        <label for="fname"></label><br />
        <input
          class="bg-transparent text-blue-600 py-2 px-4 border border-blue-500 rounded-full placeholder-blue-600 focus:outline-none focus:border-blue-500 custom-autofill"
          style="background-color: transparent !important;"
          type="text"
          id="fname"
          name="fname"
          placeholder="Fill in your name"
          on:input={handleInput}
        /><br />
      </form>
      <br />
      {#if showButton}
        <div class="flex justify-center">
          <button
            on:click={() => goto("/signup")}
            class="bg-transparent text-blue-600 font-semibold py-2 px-4 border border-blue-500 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent"
            >Start</button
          >
        </div>
      {/if}
    </div>
    <div class="text-center">
      <p class="text-blue-600">
        Welcome to the common garden of Lucullus. This Digital Common Garden is
        about connection and cross-pollination.
        <br />
        <br />Find other Gardeners to start cross-breeding and witness the
        offspring flourish in the common garden of Lucullus.
      </p>
    </div>
    <br />
    <span class="text-blue-600 font-semibold">Production:</span>
    <br />
    <span class="text-blue-600">Studio Random</span>
    <br />
    <span class="text-blue-600 font-semibold">Image Data:</span>
    <br />
    <span class="text-blue-600">Chat GPT/ Open AI</span>
    <br />
    <br />
  </main>
</div>

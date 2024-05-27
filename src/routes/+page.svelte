<script lang="ts">
  import { goto } from "$app/navigation";
</script>

<div class="container mx-auto m-8">
  <main class="bg-green-300">
    <h1 class="text-3xl font-bold text-blue-600">The Garden</h1>

    <div>
      <button
        on:click={() => goto("/garden")}
        class="bg-transparent text-blue-600 font-semibold py-2 px-4 border border-blue-500 border rounded"
        ><h2>Fill in your name</h2></button
      >
      <br />
      <br />
      <button
        on:click={() => goto("/signup")}
        class="bg-transparent text-blue-600 font-semibold py-2 px-4 border border-blue-500 border rounded"
        >Start</button
      >
    </div>
    <p class="text-blue-600">
      Welcome to the common garden of Lucullus. This Digital Common Garden is
      about connection and cross-pollination.
      <br />
      <br />Find other Gardeners to start cross-breeding and witness the
      offspring flourish in the common garden of Lucullus.
    </p>
    <br />
    <span class="text-blue-600 font-semibold">Production:</span>
    <br />
    <span class="text-blue-600">Studio Random</span>
    <br />
    <span class="text-blue-600 font-semibold">Image Data:</span>
    <br />
    <span class="text-blue-600">Chat GPT/ Open AI</span>
  </main>
</div>

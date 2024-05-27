<script lang="ts">
  import { goto } from "$app/navigation";
</script>

<div class="container mx-auto m-8">
  <main>
    <h1 class="text-3xl font-bold">Welcome to the Garden</h1>

    <div>
      <button
        on:click={() => goto("/garden")}
        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        ><h2>Enter</h2></button
      >
      <button
        on:click={() => goto("/signup")}
        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >Register</button
      >
    </div>
  </main>

  <a href="./garden/info" class="hover-bold">?</a>
</div>

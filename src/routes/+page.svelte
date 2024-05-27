<script lang="ts">
  import { goto } from "$app/navigation";
</script>

<div class="container mx-auto m-8">
  <main>
    <h1 class="text-3xl font-bold">Welcome to the Garden</h1>

    <div>
      <button on:click={() => goto("/garden")} class="btn-primary"
        ><h2>Enter</h2></button
      >
      <button on:click={() => goto("/signup")} class="btn-primary"
        >Register</button
      >
    </div>
  </main>

  <a href="./garden/info" class="hover-bold">?</a>
</div>

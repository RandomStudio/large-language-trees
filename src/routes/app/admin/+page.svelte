<script lang="ts">
  import UserLoginStatus from "$lib/UserLoginStatus.svelte";
  import type { AdminViewData } from "./+page.server";

  export let data: AdminViewData;
</script>

<main class="container mx-auto px-4">
  <h1 class="text-xl">Admin Page</h1>

  <div class="border-t-black border-2">
    <h2 class="font-bold">Initialise default data</h2>
    <div data-test="plant-db-stats">
      Currently {data.allPlants.length} plants in the database
    </div>
    <div>
      Prompt settings:
      {#if data.promptSettings}
        <span>loaded ✅</span>
      {:else}
        <span>not loaded ❌</span>
      {/if}
    </div>
    <form method="POST" action="?/initData">
      <button
        data-test="admin-init-button"
        class="bg-green-500 text-white py-2 px-4 rounded"
        data-umami-event="Admin: Initialise Data Button">Initialise data</button
      >
    </form>
  </div>

  <div class="border-t-black border-2">
    <h2 class="font-bold">Reset plants and users</h2>
    <form method="POST" action="?/reset">
      <button
        data-test="admin-reset-button"
        data-umami-event="Admin: Reset Everything Button"
        class="bg-red-500 text-white py-2 px-4 rounded"
        >Clear/reset everything</button
      >
    </form>
  </div>

  <div class="border-t-black border-2">
    <h2 class="font-bold">Prompt engineering</h2>
    <ul>
      <li>
        <a href="./admin/prompting" class="underline"
          >Test text/image generation...</a
        >
      </li>
    </ul>
  </div>

  <div class="border-t-black border-2">
    <h2 class="font-bold">Plant / image utilities</h2>
    <ul>
      <li>
        <a href="./admin/plantutils" class="underline"
          >List and edit plants/images...</a
        >
      </li>
    </ul>
  </div>

  <div class="border-t-black border-2">
    <UserLoginStatus isAdmin={data.isAdmin} username={data.username}
    ></UserLoginStatus>
  </div>
</main>

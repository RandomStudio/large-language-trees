<script lang="ts">
  import UserLoginStatus from "../../components/UserLoginStatus.svelte";
  import type { AdminViewData } from "./+page.server";

  export let data: AdminViewData;
</script>

<main class="container mx-auto px-4">
  <h1 class="text-xl">Admin Page</h1>

  <div class="border-2">
    <h2 class="font-bold">Initialise default data</h2>
    <div>
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
      <button class="bg-green-500 text-white py-2 px-4 rounded"
        >Initialise data</button
      >
    </form>
  </div>

  <div class="border-2">
    <h2 class="font-bold">Reset plants and users</h2>
    <form method="POST" action="?/reset">
      <button class="bg-red-500 text-white py-2 px-4 rounded"
        >Clear/reset everything</button
      >
    </form>
  </div>

  <div class="border-2">
    <h2 class="font-bold">Prompt engineering</h2>
    <ul>
      <li>
        <a href="/admin/prompting" class="underline"
          >Test text/image generation...</a
        >
      </li>
    </ul>
  </div>

  <div class="m-4">
    <p>
      When you're ready, you can proceed to the admin user's <a
        class="underline font-bold"
        href="/garden">garden...</a
      >
    </p>
  </div>
  <UserLoginStatus isAdmin={data.isAdmin} username={data.username}
  ></UserLoginStatus>
</main>

<script lang="ts">
  import type { SelectPlant } from "$lib/types";
  import TransparencyMaker from "../../components/TransparencyMaker.svelte";
  import UserLoginStatus from "../../components/UserLoginStatus.svelte";

  interface AdminViewData {
    username: string;
    isAdmin: boolean;
    allPlants: SelectPlant[];
  }

  export let data: AdminViewData;

  let runTransparencyTool: boolean = false;
</script>

<main class="container mx-auto">
  <h1 class="text-xl">Admin Page</h1>

  <div class="m-4">
    <form method="POST" action="?/reset">
      <button class="bg-red-500 text-white py-2 px-4 rounded"
        >Clear/reset everything</button
      >
    </form>
  </div>
  <button
    class="bg-blue-500 text-white py-2 px-4 rounded"
    on:click={() => {
      runTransparencyTool = true;
    }}>Run transparency tool...</button
  >
  {#if runTransparencyTool == true}
    <div class="m-4">
      {#each data.allPlants as plant}
        <h2>Image transparency test:</h2>
        {#if plant.imageUrl}
          <TransparencyMaker
            src={plant.imageUrl}
            useFloodFill={false}
            tolerance={8}
            onUploadComplete={() => {}}
          />
        {/if}
      {/each}
    </div>
  {/if}

  <div class="m-4">
    <p>If you can see this, you must be an admin user.</p>
  </div>
  <UserLoginStatus isAdmin={data.isAdmin} username={data.username}
  ></UserLoginStatus>
</main>

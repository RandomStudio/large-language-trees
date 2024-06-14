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
</script>

<main class="container mx-auto px-4">
  <h1 class="text-xl">Admin Page</h1>

  <div class="border-2">
    <h2>Initialise default data</h2>
    <div>
      There are currently {data.allPlants.length} plants in the database
    </div>
    <form method="POST" action="?/initplants">
      <button class="bg-green-500 text-white py-2 px-4 rounded"
        >Initialise plants</button
      >
    </form>
  </div>

  <div class="border-2">
    <h2>Reset plants and users</h2>
    <form method="POST" action="?/reset">
      <button class="bg-red-500 text-white py-2 px-4 rounded"
        >Clear/reset everything</button
      >
    </form>
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

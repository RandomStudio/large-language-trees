<script lang="ts">
  import type { SelectPlant } from "$lib/types";
  import UserLoginStatus from "$lib/shared-components/UserLoginStatus.svelte";

  interface AdminViewData {
    username: string;
    isAdmin: boolean;
    allPlants: SelectPlant[];
  }

  export let data: AdminViewData;
</script>

<main class="container mx-auto mt-20">
  <UserLoginStatus isAdmin={data.isAdmin} username={data.username}
  ></UserLoginStatus>
</main>

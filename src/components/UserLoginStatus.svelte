<script lang="ts">
  import { enhance } from "$app/forms";

  export let username: string;
  export let isAdmin: boolean;
</script>

<form method="post" action="?/logout" use:enhance>
  <button class="bg-red-500 text-white py-2 px-4 rounded">Logout</button>
</form>

<style>
</style>

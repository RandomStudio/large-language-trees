<script lang="ts">
  import { enhance } from "$app/forms";

  export let username: string;
  export let isAdmin: boolean;
</script>

<div class="border rounded">
  <div>
    You are: {username}
    {#if isAdmin === true}
      <a href="/admin" class="text-blue-500">Admin Page</a>
    {/if}
  </div>
  <form method="post" action="?/logout" use:enhance>
    <button
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      >Logout</button
    >
  </form>
</div>

<style>
</style>

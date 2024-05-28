<script lang="ts">
  import { enhance } from "$app/forms";

  export let username: string;
</script>

You are: {username}
<form method="post" use:enhance>
  <button
    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    >Logout</button
  >
</form>

<style>
</style>

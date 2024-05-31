<script lang="ts">
  import { enhance } from "$app/forms";

  export let username: string;
  export let isAdmin: boolean;
</script>

<form method="post" action="?/logout" use:enhance>
  <button class="text-roel_blue bg-transparent">Logout</button>
</form>

<style>
</style>

<script lang="ts">
  import { enhance } from "$app/forms";

  import type { ActionData } from "./$types";

  export let form: ActionData;
</script>

<main class="container mx-auto m-8">
  <h1 class="text-xl font-bold">Sign up</h1>
  <form method="post" use:enhance>
    <div>
      <label for="username">Username</label>
      <input name="username" id="username" class="border" />
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" name="password" id="password" class="border" />
    </div>
    <div>
      <button
        class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded active:bg-roel_blue active:text-roel_green"
        >Continue</button
      >
    </div>
  </form>

  {#if form?.message}
    <div>
      Error: {form.message}
    </div>
  {/if}
</main>

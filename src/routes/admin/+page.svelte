<script lang="ts">
  import UserLoginStatus from "../../components/UserLoginStatus.svelte";

  interface AdminViewData {
    username: string;
    isAdmin: boolean;
  }

  export let data: AdminViewData;
</script>

<main class="container mx-auto">
  <h1 class="text-xl">Admin Page</h1>

  <div>
    <form method="POST">
      <button
        class="bg-red-500 text-white py-2 px-4 rounded"
        formaction="?/reset">Clear/reset everything</button
      >
    </form>
  </div>

  <p>If you can see this, you must be an admin user.</p>
  <UserLoginStatus isAdmin={data.isAdmin} username={data.username}
  ></UserLoginStatus>
</main>

<script lang="ts">
  import TransparencyMaker from "../../components/TransparencyMaker.svelte";
  import UserLoginStatus from "../../components/UserLoginStatus.svelte";

  interface AdminViewData {
    username: string;
    isAdmin: boolean;
  }

  export let data: AdminViewData;
</script>

<main class="container mx-auto">
  <h1 class="text-xl">Admin Page</h1>

  <div class="m-4">
    <form method="POST">
      <button
        class="bg-red-500 text-white py-2 px-4 rounded"
        formaction="?/reset">Clear/reset everything</button
      >
    </form>
  </div>
  <div class="m-4">
    <h2>Image transparency test:</h2>
    <TransparencyMaker src={"/plants/Mangrove.png"} />
  </div>

  <div class="m-4">
    <p>If you can see this, you must be an admin user.</p>
  </div>
  <UserLoginStatus isAdmin={data.isAdmin} username={data.username}
  ></UserLoginStatus>
</main>

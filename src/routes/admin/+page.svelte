<script lang="ts">
  import UserLoginStatus from "../../components/UserLoginStatus.svelte";

  interface AdminViewData {
    username: string;
  }

  export let data: AdminViewData;
</script>

<h1>Admin Page</h1>

<p>If you can see this, you must be an admin user.</p>

<UserLoginStatus username={data.username}></UserLoginStatus>

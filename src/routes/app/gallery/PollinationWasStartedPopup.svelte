<script lang="ts">
  import type { CandidatePlant, PublicUserInfo } from "$lib/types";

  export let otherUser: PublicUserInfo;
</script>

<div
  class="border-2 border-solid border-red-500 w-screen h-screen p-4 m-4 fixed top-0 left-0 bg-slate-600"
>
  <h1>Hooray!</h1>

  <div>
    You and {otherUser.username} gave life to a new seed together.
  </div>

  <div>otherUser.username} has the privilege to name your new sprout.</div>
</div>

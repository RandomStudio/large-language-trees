<script lang="ts">
  export let data;
</script>

{#each data.gardensWithPlantCounts as { user, count }}
  <div>
    <span>
      {user.username}
    </span>
    <span>
      x{count}
    </span>
  </div>
{/each}

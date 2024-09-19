<script lang="ts">
  export let data;
</script>

<div class="w-screen h-screen items-center justify-center standard-gradient">
  <div
    class="w-screen text-center text-roel_yellow text-4xl font-gyst absolute top-32 z-10 uppercase"
  >
    Most Active<br />
    Pollinators
  </div>

  <div
    class="w-screen text-center text-new_purple text-4xl font-gyst absolute bottom-32 z-10 uppercase"
  >
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
  </div>
</div>

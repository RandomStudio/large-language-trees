<script lang="ts">
  import type { PublicUserInfo, SelectPlant } from "$lib/types";

  export let plantsWithusers: { plant: SelectPlant; user: PublicUserInfo }[];
</script>

{#each plantsWithusers as featuredPlant}
  {featuredPlant.plant.commonName}
  {featuredPlant.user.username}
{/each}

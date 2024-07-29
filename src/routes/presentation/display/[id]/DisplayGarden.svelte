<script lang="ts">
  import type { GardenWithPlants } from "$lib/types";

  export let garden: GardenWithPlants;
  export let width = 1000;
  export let height = 1000;
  export let xGarden = 500;
  export let yGarden = 200;

  let positions: {
    x: number;
    y: number;
    zIndex: number;
    grasses: {
      x: number;
      y: number;
      size: number;
      zIndexGrass: number;
    }[];
  }[] = [];

  function randomizePositions() {
    positions = garden.plantsInGarden.map(() => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const zIndex = Math.floor(y); // Assurez-vous que c'est un entier
      const grasses = grassAroundMain({ x, y, zIndex });
      return { x, y, zIndex, grasses };
    });
  }

  function grassAroundMain(position: { x: number; y: number; zIndex: number }) {
    const size = 45;
    return [
      {
        x: position.x + 25,
        y: position.y + 60,
        size,
        zIndexGrass: position.zIndex + 1
      },
      {
        x: position.x + 25,
        y: position.y + 10,
        size,
        zIndexGrass: position.zIndex
      },
      {
        x: position.x,
        y: position.y + 40,
        size,
        zIndexGrass: position.zIndex
      },
      {
        x: position.x + 50,
        y: position.y + 40,
        size,
        zIndexGrass: position.zIndex
      }
    ];
  }

  randomizePositions();
</script>

<div
  class="fixed"
  style="width: {width}px; height: {height}px; position: absolute; left: {xGarden}px; top: {yGarden}px; "
>
  {#each positions as { x, y, grasses, zIndex }, index}
    {#each grasses as grass}
      <img
        src="/grassjess.png"
        alt="Grass"
        class="absolute"
        style={`left: ${grass.x}px; top: ${grass.y}px; width: ${grass.size}px; z-index: ${grass.zIndexGrass};`}
      />
    {/each}
    <img
      src={garden.plantsInGarden[index].plant.imageUrl}
      alt="Plant"
      class="absolute"
      style={`left: ${x}px; top: ${y}px; width: 100px; height: auto; z-index: ${zIndex};`}
    />
    {#if garden.plantsInGarden[index].plant.parent1 == null}
      <div
        class=" absolute font-primer text-2xl text-roel_purple px-2 py-1 bg-roel_green text-center"
        style={`left: ${x}px; top: ${y + 80}px; width: 120px; height: auto; z-index: ${zIndex};`}
      >
        {garden.name}
      </div>
    {/if}
  {/each}
</div>

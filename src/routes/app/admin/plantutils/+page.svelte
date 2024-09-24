<script lang="ts">
  export let data;

  let previewImage: string | null = null;

  const deletePlantFromGardens = async (id: string) => {
    const res = await fetch(`/api/plantsInGarden?plantId=${id}`, {
      method: "DELETE"
    });
    if (res.status === 200) {
      console.log("deleted all plants-in-gardens entries for", id, "OK");
      // TODO: should we (optionally) also delete the plant itself from plants list?
    } else {
      console.error("error from API:", res.status, res.statusText);
    }
  };
</script>

<main class="container p-4 w-screen">
  <h1 class="text-xl">Plant/Image utils</h1>

  {#each data.plantsInGardens as { plant, garden }}
    <div class="grid grid-cols-3 p-4 border-dark_grey border-2 m-2">
      <div>
        <div class="text-xs">
          ID {plant.id}
        </div>
        <div class="text-md">
          {plant.commonName}
        </div>
        <div class="text-md">
          As owned by <span class="font-bold">{garden.myOwner.username}</span>
        </div>
      </div>

      <div>
        <button
          class="border-green-300 border-2 hover:border-green-950"
          on:click={() => {
            previewImage = plant.imageUrl;
          }}
        >
          <img class="w-16" src={plant.imageUrl} alt={plant.description} />
        </button>
      </div>

      <div>
        <button class="bg-green-500 text-white py-2 px-4 rounded"
          >Process</button
        >
        <button class="bg-red-500 text-white py-2 px-4 rounded">Delete</button>
      </div>
    </div>
  {/each}

  {#if previewImage}
    <div class="absolute top-8 left-8 p-2 m-4 bg-white shadow-lg">
      <button
        class="bg-red-500 text-white py-2 px-4 rounded"
        on:click={() => {
          previewImage = null;
        }}
      >
        Close ❌
      </button>
      <img src={previewImage} alt={`preview of ${previewImage}`} />
    </div>
  {/if}
</main>

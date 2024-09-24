<script lang="ts">
  import { invalidateAll } from "$app/navigation";

  export let data;

  let previewImage: string | null = null;

  const deletePlantFromGardens = async (id: string) => {
    const deletedEntry = await fetch(`/api/plantsInGarden?plantId=${id}`, {
      method: "DELETE"
    });
    if (deletedEntry.status === 200 || deletedEntry.status === 202) {
      console.log("deleted all plants-in-gardens entries for", id, "OK");
      const deletedPlant = await fetch(`/api/plants/${id}`, {
        method: "DELETE"
      });
      if (deletedPlant.status === 200) {
        console.log("plant deleted OK");
      } else {
        console.error(
          "Unexpected response from API:",
          deletedPlant.status,
          deletedPlant.statusText
        );
      }
    } else {
      console.error(
        "Unexpected from API:",
        deletedEntry.status,
        deletedEntry.statusText
      );
    }
  };
</script>

<main class="container p-4 w-screen">
  <h1 class="text-xl">Plant/Image utils</h1>

  {#each data.plantsWithOwners as plant}
    <div class="grid grid-cols-3 p-4 border-dark_grey border-2 m-2">
      <div>
        <div class="text-xs">
          ID {plant.id}
        </div>
        <div class="text-md">
          {plant.commonName}
        </div>
        <div class="text-md">
          {#if plant.authorTopUser || plant.authorBottomUser}
            As owned by <span class="font-bold">
              <span>{plant.authorTopUser?.username}, </span>
              <span>{plant.authorBottomUser?.username}</span>
            </span>
          {:else}
            No owners
          {/if}
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
        <button
          class="bg-red-500 text-white py-2 px-4 rounded"
          on:click={async () => {
            await deletePlantFromGardens(plant.id);
            invalidateAll();
          }}>Delete</button
        >
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

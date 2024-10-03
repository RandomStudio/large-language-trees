<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import TransparencyMaker from "$lib/shared-components/TransparencyMaker.svelte";
  import type { AttachImageRequest } from "$lib/types.js";
  import { jsonb } from "drizzle-orm/pg-core";

  export let data;

  let previewImage: string | null = null;

  let processPreview: string | null = null;
  let processReplace: { plantId: string; originalImage: string } | null = null;

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

  const replaceImageFor = async (plantId: string, newUrl: string) => {
    const body: AttachImageRequest = {
      plantId,
      url: newUrl
    };
    const res = await fetch(`/api/images/attach`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    if (res.status === 200) {
      console.log("update for plant image appeared to be successful");
    } else {
      console.error(
        "Unexpected response from server:",
        res.status,
        res.statusText
      );
    }
  };
</script>

<main class="container p-4 w-screen">
  <div>
    <a href="/app/admin" class="text-xs italic">← Back to admin</a>
  </div>

  <h1 class="text-xl">Plant/Image utils</h1>

  {#each data.plantsWithOwners as plant}
    <div class="grid grid-cols-4 p-4 border-2 m-2 border-gray-700">
      <div>
        <div class="text-xs">
          ID {plant.id}
        </div>
        <div class="text-lg">
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
          <img
            class="w-16"
            src={plant.imageUrl}
            alt={plant.description}
            crossorigin="anonymous"
          />
        </button>
      </div>

      <div>
        <button
          class="bg-green-500 text-white py-2 px-4 rounded"
          on:click={() => {
            processPreview = plant.imageUrl;
          }}
          >Process PREVIEW
        </button>
        <button
          class="bg-orange-500 text-white py-2 px-4 rounded"
          on:click={() => {
            processReplace = {
              plantId: plant.id,
              originalImage: plant.imageUrl || ""
            };
          }}
          >Process REPLACE
        </button>
      </div>

      <div>
        <button
          class="bg-red-500 text-white py-2 px-4 rounded"
          on:click={async () => {
            await deletePlantFromGardens(plant.id);
            invalidateAll();
          }}
          >Delete
        </button>
      </div>
    </div>
  {/each}

  {#if previewImage}
    <div class="fixed top-8 left-8 p-2 m-4 bg-white shadow-lg">
      <button
        class="bg-red-500 text-white py-2 px-4 rounded"
        on:click={() => {
          previewImage = null;
        }}
      >
        Close ❌
      </button>
      <img
        src={previewImage}
        alt={`preview of ${previewImage}`}
        crossorigin="anonymous"
      />
    </div>
  {/if}

  {#if processPreview}
    <div class="fixed top-8 left-8 p-2 m-4 bg-white shadow-lg">
      <div>
        <button
          class="bg-red-500 text-white py-2 px-4 rounded"
          on:click={() => {
            processPreview = null;
          }}
        >
          Cancel ❌
        </button>
      </div>
      <TransparencyMaker
        src={processPreview}
        doUpload={false}
        onUploadComplete={() => {
          processPreview = null;
        }}
      />
    </div>
  {/if}

  {#if processReplace}
    <div class="fixed top-8 left-8 p-2 m-4 bg-white shadow-lg">
      <div>
        <button
          class="bg-red-500 text-white py-2 px-4 rounded"
          on:click={() => {
            processReplace = null;
          }}
        >
          OK ✅
        </button>
      </div>
      <TransparencyMaker
        src={processReplace.originalImage}
        doUpload={true}
        onUploadComplete={async (replacedImage) => {
          console.log("uploadcomplete");
          if (processReplace) {
            console.log("replacing image");
            await replaceImageFor(processReplace.plantId, replacedImage);
            await invalidateAll();
          }
        }}
      />
    </div>
  {/if}
</main>

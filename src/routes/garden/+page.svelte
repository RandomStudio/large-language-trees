<script lang="ts">
  import UserLoginStatus from "../../components/UserLoginStatus.svelte";

  import {
    type GardenPlantEntry,
    type GardenViewData,
    type InsertPlant,
    type SeedbankEntry,
    type SelectPlant,
  } from "../../lib/types"; // Assuming type import is correct

  export let data: GardenViewData;

  // import { pickMultiple } from "random-elements";

  import { GRID_HEIGHT, GRID_WIDTH } from "../../defaults/constants";
  import PlantCell from "../../components/PlantCell.svelte";

  import PopupInfo from "../../components/PopupInfo.svelte";
  import { buildPrompt } from "../../lib/promptUtils";

  import DefaultPromptConfig from "../../defaults/prompt-config";
  import ConfirmBreed from "../../components/ConfirmBreed.svelte";
  import FullScreenLoading from "../../components/FullScreenLoading.svelte";
  import { invalidateAll } from "$app/navigation";

  let candidateParents: [SelectPlant, SelectPlant] | null = null;
  let candidateChild: InsertPlant | null = null;

  let timeout: NodeJS.Timeout | null = null;

  let selectedPlant: SelectPlant | null = null;

  let waitingForGeneration = false;

  interface GridCell {
    plant?: SelectPlant;
    highlighted: boolean;
    column: number;
    row: number;
  }

  let grid: GridCell[] = [];

  async function confirmBreed(
    parents: [SelectPlant, SelectPlant]
  ): Promise<InsertPlant> {
    console.log("confirmBreed...");
    const res = await fetch("/api/generate/plant", {
      method: "POST",
      body: JSON.stringify({
        prompt: buildPrompt(DefaultPromptConfig, parents[0], parents[1]),
        parents,
      }),
    });
    if (res.status === 200) {
      console.log("Created new candidate plant OK:", res);
      return (await res.json()) as InsertPlant;
    } else {
      const { status, statusText } = res;
      console.error("Error generating on backend:", { status, statusText });
      throw Error("Generate failure");
    }
  }

  function areClose(plant1: SelectPlant, plant2: SelectPlant): boolean {
    const plant1Cell = grid.find((c) => c.plant && c.plant.id === plant1.id);
    const plant2Cell = grid.find((c) => c.plant && c.plant.id === plant2.id);

    console.log("areClose", plant1.id, plant2.id);

    if (plant1Cell && plant2Cell) {
      return (
        Math.abs(plant1Cell.row - plant2Cell.row) <= 1 &&
        Math.abs(plant1Cell.column - plant2Cell.column) <= 1
      );
    } else {
      // do not have two occupied cells to compare
      return false;
    }
  }

  function checkAnyCloseTo(cell: GridCell) {
    console.log("checkAnyCloseTo cell at", cell.row, cell.column);
    if (cell.plant) {
      console.log("plant is", cell.plant);
      const thisPlant = cell.plant;
      for (const entry of data.garden.plantsInGarden) {
        const otherPlant = entry.plant;
        if (thisPlant.id !== otherPlant.id) {
          // not self
          const [plant1, plant2] = [thisPlant, otherPlant];
          if (areClose(plant1, plant2)) {
            candidateParents = [plant1, plant2];
            timeout = setTimeout(() => {
              console.log(
                "ready for mixing : " +
                  plant1.commonName +
                  " and " +
                  plant2.commonName +
                  " !"
              );
              waitingForGeneration = true;
              confirmBreed([plant1, plant2])
                .then((newPlant) => {
                  candidateChild = newPlant;
                  waitingForGeneration = false;
                })
                .catch((e) => {
                  console.error("Error from confirm/generate breed:", e);
                  waitingForGeneration = false;
                });
            }, 4000);
          }
        }
      }
    } else {
      // empty cell no need to check
      return false;
    }
  }

  const populateGrid = () => {
    console.log(
      "populateGrid with",
      data.garden.plantsInGarden.length,
      "plants"
    );
    grid = [];
    for (let r = 0; r < GRID_HEIGHT; r++) {
      for (let c = 0; c < GRID_WIDTH; c++) {
        const plant = data.garden.plantsInGarden.find(
          (p) => p.colIndex === c && p.rowIndex === r
        );
        if (plant) {
          const plantObject = plant.plant;
          grid.push({
            plant: plantObject,
            row: r,
            column: c,
            highlighted: false,
          });
        } else {
          grid.push({
            row: r,
            column: c,
            plant: undefined,
            highlighted: false,
          });
        }
      }
    }
  };

  function dragStart(event: CustomEvent<{ e: DragEvent; gridIndex: number }>) {
    const { e, gridIndex } = event.detail;
    console.log("dragStart from", gridIndex);
    e.dataTransfer?.setData("text/plain", gridIndex.toString());
  }

  function dragOver(e: DragEvent, index: number) {
    e.preventDefault();
    grid[index].highlighted = true;
    console.log("dragOver");
  }

  function dragLeave(e: DragEvent, index: number) {
    e.preventDefault();
    grid[index].highlighted = false;
  }

  function drop(e: DragEvent, dstIndex: number) {
    e.preventDefault();
    if (timeout !== null) {
      console.log("clearTimeout");
      clearTimeout(timeout);
    }
    console.log("drop to grid index", dstIndex);
    const cellDropData = e.dataTransfer?.getData("text/plain");
    if (cellDropData) {
      const srcIndex = parseInt(cellDropData);
      console.log("transfer", srcIndex, "to", dstIndex);
      const srcPlant = grid[srcIndex].plant;
      if (srcPlant) {
        grid[dstIndex].plant = srcPlant;
        grid[srcIndex].plant = undefined; // clear original cell
        grid[dstIndex].highlighted = false;

        const dstCell = grid[dstIndex];

        const gardenId = data.garden.id;
        const plantId = srcPlant.id;
        const colIndex = dstCell.column;
        const rowIndex = dstCell.row;

        const updated: GardenPlantEntry = {
          gardenId,
          plantId,
          colIndex,
          rowIndex,
        };

        fetch("/api/plantsInGarden/", {
          method: "PATCH",
          body: JSON.stringify(updated),
        })
          .then((res) => {
            checkAnyCloseTo(dstCell);

            if (res.status == 200) {
              console.info("Updated plant position on backend OK:", res);
              invalidateAll();
            } else {
              const { status, statusText } = res;
              console.error("Error response from server:", {
                status,
                statusText,
                srcPlant,
                // updatedPlant,
              });
            }
          })
          .catch((fetchError) => {
            console.error("Error updating plant on backend:", fetchError);
          });
      } else {
        console.error("There was a problem moving the plant (in the frontend)");
      }
    }
  }

  async function addNewPlant(imageURL: string | null) {
    if (candidateChild) {
      if (imageURL) {
        console.log("will attach image", imageURL);
        candidateChild.imageUrl = imageURL;
      }
      const res = await fetch("/api/plants", {
        method: "POST",
        body: JSON.stringify(candidateChild),
      });
      const { status, statusText, body } = res;
      if (status === 201) {
        console.log("Sucessfully added!");

        // Also place in garden...
        const plantId = candidateChild.id;
        const gardenId = data.garden.id;
        const rowIndex = 0;
        const colIndex = 0;
        const updated = {
          plantId,
          gardenId,
          rowIndex,
          colIndex,
        };
        const placementRes = await fetch("/api/plantsInGarden", {
          method: "POST",
          body: JSON.stringify(updated),
        });
        console.log("Placed in garden?", placementRes);

        // Also place in user seedbank...
        const entry: SeedbankEntry = {
          plantId,
          seedbankId: data.seedBank.id,
        };
        const seedbankRes = await fetch("/api/plantsInSeedbank", {
          method: "POST",
          body: JSON.stringify(entry),
        });
        if (seedbankRes.status === 201) {
          console.log("successsfully added to Seedbank");
        }

        // Reload data for page
        console.log("Reloading page data...");
        await invalidateAll();
        populateGrid();
        console.log("...done");
        candidateChild = null;
      } else {
        console.error("Error adding new plant:", { status, statusText });
        candidateChild = null;
      }
    } else {
      console.error(
        "Whoops! Where is the candidate child plant we're confirming?"
      );
    }
  }

  populateGrid();
</script>

<!-- <nav> -->
<div>
  <UserLoginStatus
    isAdmin={data.user.isAdmin || false}
    username={data.user.username}
  ></UserLoginStatus>
</div>
<!-- </nav> -->

<main class="container mx-auto overflow-visible">
  <div class="grid grid-cols-6 gap-4 justify-stretch overflow-visible">
    {#each grid as gridCell, gridIndex}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="relative bg-roel_blue min-w-[100px] min-h-[100px] overflow-visible"
        on:click={() => {
          console.log("click!");
          if (gridCell.plant) {
            selectedPlant = gridCell.plant;
          } else {
            console.error("not clickable!");
          }
        }}
      >
        {#if gridCell.plant}
          <div class="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] z-10">
            <img
              src={gridCell.plant.imageUrl}
              alt={gridCell.plant.commonName}
              class="scale-125"
            />
          </div>
        {:else}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class:bg-roel_blue={gridCell.highlighted}
            on:drop={(e) => {
              drop(e, gridIndex);
            }}
            on:dragover={(e) => dragOver(e, gridIndex)}
            on:dragleave={(e) => dragLeave(e, gridIndex)}
          >
            <!-- Optionally maintain a placeholder or remove content entirely -->
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if selectedPlant}
    <div
      class="fixed inset-0 bg-roel_blue flex items-center justify-center z-50 p-4 overflow-auto"
    >
      <div
        class="m-auto bg-white p-4 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-lg"
      >
        <PopupInfo
          allSeeds={data.seedBank.plantsInSeedbank.map((s) => s.plant)}
          plantDetails={selectedPlant}
          closePopup={() => {
            selectedPlant = null;
          }}
        />
      </div>
    </div>
  {/if}

  {#if candidateChild}
    <ConfirmBreed
      {candidateChild}
      allSeeds={data.seedBank.plantsInSeedbank.map((s) => s.plant)}
      onCancel={() => {
        candidateChild = null;
      }}
      onConfirm={addNewPlant}
    />
  {/if}

  {#if waitingForGeneration}
    <FullScreenLoading />
  {/if}
</main>

{#if waitingForGeneration}
  <FullScreenLoading />
{/if}

<style>
</style>

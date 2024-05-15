<script lang="ts">
  import { type SelectPlant } from "../lib/types"; // Assuming type import is correct
  export let data: { seeds: SelectPlant[] };

  import "./main.css";
  import { GRID_HEIGHT, GRID_WIDTH, CELL_SIZE } from "../defaults/constants";
  import PlantCell from "../components/PlantCell.svelte";

  import PopupInfo from "../components/PopupInfo.svelte";
  import { buildPrompt } from "../lib/promptUtils";

  import DefaultPromptConfig from "../defaults/prompt-config";

  let candidateParents: [SelectPlant, SelectPlant] | null = null;

  let timeout: NodeJS.Timeout | null = null;

  let selectedPlant: SelectPlant | null = null;

  function areClose(plant1: SelectPlant, plant2: SelectPlant): boolean {
    if (
      plant1.rowIndex !== null &&
      plant2.rowIndex !== null &&
      plant1.colIndex !== null &&
      plant2.colIndex !== null
    ) {
      if (
        (Math.abs(plant1.rowIndex - plant2.rowIndex) === 1 &&
          plant1.colIndex - plant2.colIndex === 0) ||
        (plant1.rowIndex - plant2.rowIndex === 0 &&
          Math.abs(plant1.colIndex - plant2.colIndex) === 1)
      ) {
        console.log(
          plant1.commonName + " and " + plant2.commonName + " are close!"
        );
        candidateParents = [plant1, plant2];
        // Lancer le timer de 5 secondes
        timeout = setTimeout(() => {
          console.log(
            "ready for mixing : " +
              plant1.commonName +
              " and " +
              plant2.commonName +
              " !"
          );
          // const res = await fetch("/api/generate/plant", {
          //   method: "POST",
          //   body: JSON.stringify({
          //     prompt: buildPrompt(DefaultPromptConfig, parents[0], parents[1]),
          //     parents,
          //   }),
          // });
        }, 4000);

        return true;
      } else {
        if (
          candidateParents &&
          candidateParents[0] == plant1 &&
          candidateParents[1] == plant2 &&
          timeout !== null
        ) {
          console.log("cleartimeout");
          clearTimeout(timeout);
          timeout = null; // the timeout has been cleared, but this does not affect the value of the variable `timeout`
        }
        return false;
      }
    } else {
      return false;
    }
  }

  function checkAllClose(id: number) {
    console.log("check");
    const seeds = data.seeds;
    const plant = data.seeds.find((e) => e.id === id);
    if (plant) {
      for (let j = 0; j < seeds.length; j++) {
        if (seeds[j] != plant) {
          areClose(plant, seeds[j]);
        }
      }
    }
  }

  interface GridCell {
    plant?: SelectPlant;
    highlighted: boolean;
    column: number;
    row: number;
  }

  let grid: GridCell[] = [];

  const populateGrid = () => {
    for (let r = 0; r < GRID_HEIGHT; r++) {
      for (let c = 0; c < GRID_WIDTH; c++) {
        const plant = data.seeds.find(
          (p) => p.colIndex === c && p.rowIndex === r
        );
        grid.push({ plant, row: r, column: c, highlighted: false });
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
    // console.log("drop");
    const cellDropData = e.dataTransfer?.getData("text/plain");
    if (cellDropData) {
      const srcIndex = parseInt(cellDropData);
      console.log("transfer", srcIndex, "to", dstIndex);
      const srcPlant = grid[srcIndex].plant;
      if (srcPlant) {
        grid[dstIndex].plant = srcPlant;
        grid[srcIndex].plant = undefined;
        grid[dstIndex].highlighted = false;

        const dstCell = grid[dstIndex];

        const updatedPlant: SelectPlant = {
          ...srcPlant,
          colIndex: dstCell.column,
          rowIndex: dstCell.row,
        };
        data.seeds.forEach((p) => {
          if (p.id == updatedPlant.id) {
            p.colIndex = updatedPlant.colIndex;
            p.rowIndex = updatedPlant.rowIndex;
            console.log("running");
          }
        });
        checkAllClose(updatedPlant.id);
        fetch("/api/plants/" + updatedPlant.id, {
          method: "PATCH",
          body: JSON.stringify(updatedPlant),
        })
          .then((res) => {
            if (res.status == 200) {
              console.info("Updated plant on backend OK:", res);
            } else {
              const { status, statusText } = res;
              console.error("Error response from server:", {
                status,
                statusText,
                srcPlant,
                updatedPlant,
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

  populateGrid();
</script>

<p>Fantasy Garden</p>
<main>
  <div
    class="grid-container"
    style:width={GRID_WIDTH * CELL_SIZE + "px"}
    style:height={GRID_HEIGHT * CELL_SIZE + "px"}
  >
    {#each grid as gridCell, gridIndex}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="cell"
        style:left={gridCell.column * CELL_SIZE + "px"}
        style:top={gridCell.row * CELL_SIZE + "px"}
        style:width={CELL_SIZE + "px"}
        style:height={CELL_SIZE + "px"}
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
          <PlantCell
            data={gridCell.plant}
            {gridIndex}
            on:dragStart={dragStart}
          />
        {:else}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="empty"
            on:drop={(e) => {
              drop(e, gridIndex);
            }}
            on:drop={(e) => {
              console.log("drop");
              drop(e, gridIndex);
            }}
            on:dragover={(e) => dragOver(e, gridIndex)}
            on:dragleave={(e) => dragLeave(e, gridIndex)}
          />
        {/if}
      </div>
    {/each}
  </div>
  {#if selectedPlant}
    <PopupInfo
      plantDetails={selectedPlant}
      closePopup={() => {
        selectedPlant = null;
      }}
    ></PopupInfo>
  {/if}

  <a href="/info" class="hover-bold">?</a>

  <button
    class="debug-button"
    on:click={() => {
      // breedingState = BreedState.CANDIDATES_SELECTED;
    }}>Test breed</button
  >
</main>

<a href="/info" class="hover-bold">?</a>
<a href="/landing_page">Landing page</a>

<style>
  main {
    display: flex;
    align-items: center; /* Centers content vertically in the container */
    justify-content: center; /* Centers content horizontally in the container */
    height: 100vh; /* Full viewport height */
    overflow: hidden; /* Hide overflow */
    position: relative; /* Ensures that it is the positioning context for any absolutely positioned children, if needed */
  }

  .grid-container {
    display: block;
    position: relative; /* Essential for absolutely positioned children */
    margin: auto; /* Center the container horizontally */
    padding: 10px;
    box-sizing: border-box; /* Include border and padding in the width/height */
    top: -50px;
  }

  .cell {
    position: absolute; /* Positioning relative to .grid-container */
    border: 1px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 27px; /* Width of each cell */
    height: 27px; /* Height of each cell */
  }

  p {
    text-align: center;
    font-size: 15px;
  }

  .hover-bold:hover {
    font-weight: bold; /* Makes the font bold on hover */
  }

  .cell .empty {
    width: 100%;
    height: 100%;
  }

  .debug-button {
    position: absolute;
    right: 0;
  }
</style>

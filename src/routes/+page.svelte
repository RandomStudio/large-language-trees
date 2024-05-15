<script lang="ts">
  import { type SelectPlant } from "../types"; // Assuming type import is correct
  export let data: { seeds: SelectPlant[] };

  import "./main.css";
  import { GRID_HEIGHT, GRID_WIDTH, CELL_SIZE } from "../defaults/constants";
  import PlantCell from "./PlantCell.svelte";

  import Popupinfo from "./PopupInfo.svelte";

  let selectedPlant: SelectPlant | undefined;

  function openPopup(plant?: SelectPlant) {
    selectedPlant = plant;
  }

  function closePopup() {
    selectedPlant = undefined;
  }

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
          plant1.commonName + " and " + plant2.commonName + " are close!",
        );
        return true;
      } else {
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
          (p) => p.colIndex === c && p.rowIndex === r,
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

<a href="/infoplant">Infoplant</a>

<main>
  <h1>Fantasy Garden</h1>

  <div class="grid-container">
    {#each grid as gridCell, gridIndex}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="cell"
        style="left: {gridCell.column * CELL_SIZE}px; top: {gridCell.row *
          CELL_SIZE}px;"
        on:click={() => openPopup(gridCell.plant)}
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
              drop(e, gridIndex);
            }}
            on:dragover={(e) => dragOver(e, gridIndex)}
            on:dragleave={(e) => dragLeave(e, gridIndex)}
          >
            empty
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <Popupinfo plantDetails={selectedPlant} {closePopup}></Popupinfo>

  <a href="/info" class="hover-bold">?</a>
</main>

<style>
  h1 {
    text-align: center;
    font-size: 15px;
  }
  h1 {
    text-align: center;
    font-size: 15px;
  }

  .hover-bold {
    font-size: 15px;
    position: fixed;
    left: 10px;
    bottom: 10px;
    cursor: pointer; /* Changes the cursor to a pointer to indicate it's interactive */
    transition: font-weight 0.2s ease; /* Optional: adds a smooth transition for the font weight change */
    text-decoration: none; /* Optional: removes underline from the link, depending on your design needs */
    color: inherit; /* Optional: ensures the link color matches the surrounding text unless otherwise needed */
    z-index: 10;
  }

  .hover-bold:hover {
    font-weight: bold; /* Makes the font bold on hover */
  }

  .cell {
    width: 64px;
    height: 64px;
    position: absolute;
    border: 1px solid grey;
  }

  .cell .empty {
    width: 100%;
    height: 100%;
  }
</style>

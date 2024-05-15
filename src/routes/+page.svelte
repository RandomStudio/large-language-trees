<script lang="ts">
  import { type SelectPlant } from "../lib/types"; // Assuming type import is correct
  export let data: { seeds: SelectPlant[] };

  import "./main.css";
  import { GRID_HEIGHT, GRID_WIDTH, CELL_SIZE } from "../defaults/constants";
  import PlantCell from "../components/PlantCell.svelte";

  import Popupinfo from "../components/PopupInfo.svelte";

  let selectedPlant: SelectPlant | undefined;

  function openPopup(plant?: SelectPlant) {
    selectedPlant = plant;
  }

  function closePopup() {
    selectedPlant = undefined;
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
    const data = e.dataTransfer?.getData("text/plain");
    if (data) {
      const srcIndex = parseInt(data);
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
    <Popupinfo plantDetails={selectedPlant} {closePopup}></Popupinfo>
  {/if}

  <a href="/info" class="hover-bold">?</a>
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
</style>

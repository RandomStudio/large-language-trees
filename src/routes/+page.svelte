<script lang="ts">
  import { type SelectPlant } from "../types"; // Assuming type import is correct
  export let data: { seeds: SelectPlant[] };

  import "./main.css";
  import { GRID_HEIGHT, GRID_WIDTH, CELL_SIZE } from "../defaults/constants";
  import PlantCell from "./PlantCell.svelte";

  import Popupinfo from "./popupinfo.svelte";

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

  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      const plant = data.seeds.find(
        (p) => p.colIndex === c && p.rowIndex === r
      );
      grid.push({ plant, row: r, column: c });
    }
  }

  populateGrid();
</script>

<a href="/infoplant">Infoplant</a>

<main>
  <h1>Fantasy Garden</h1>

  <div class="grid-container">
    {#each grid as gridCell, gridIndex}
      <div
        class="cell"
        style="left: {gridCell.column * CELL_SIZE}px; top: {gridCell.row *
          CELL_SIZE}px;"
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

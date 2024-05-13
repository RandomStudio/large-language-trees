<script lang="ts">
  import { type SelectPlant } from "../types"; // Assuming type import is correct
  export let data: { seeds: SelectPlant[] };

  import "./main.css";
  import { GRID_HEIGHT, GRID_WIDTH, CELL_SIZE } from "../defaults/constants";

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

  function dragStart(e: DragEvent, srcIndex: number) {
    console.log("dragStart");
    const data = srcIndex;
    e.dataTransfer?.setData("text/plain", data.toString());
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
      }
    }
  }

  populateGrid();
</script>

<a href="/infoplant">Infoplant</a>

<main>
  <h1>Fantasy Garden</h1>

  <div class="grid-container">
    {#each grid as gridCell, i}
      <div
        class={"cell" + (gridCell.highlighted ? " highlighted" : "")}
        style:left={gridCell.column * CELL_SIZE + "px"}
        style:top={gridCell.row * CELL_SIZE + "px"}
      >
        {#if gridCell.plant}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="populated"
            draggable={true}
            on:dragstart={(e) => {
              dragStart(e, i);
            }}
          >
            {#if gridCell.plant.imageUrl}
              <img
                src={gridCell.plant.imageUrl}
                alt="the real plant"
                class="thumbnail"
              />
            {:else}
              <img
                src={"/plants/placeholder.png"}
                alt="placeholder"
                class="thumbnail"
              />
            {/if}
            <div class="plant-name">
              {gridCell.plant.commonName}
            </div>
          </div>
        {:else}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="empty"
            on:drop={(e) => {
              drop(e, i);
            }}
            on:dragover={(e) => dragOver(e, i)}
            on:dragleave={(e) => dragLeave(e, i)}
          >
            Empty
          </div>
        {/if}
      </div>
    {/each}
    <!-- {#each data.seeds as plant}
    {/each} -->
  </div>

  <a href="/info" class="hover-bold">?</a>
</main>

<style>
  body {
    font-size: 10px;
    font-family: Arial, Helvetica, sans-serif;
  }

  h1 {
    text-align: center;
    font-size: 15px;
  }

  h2 {
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
    z-index: 1000;
  }

  .hover-bold:hover {
    font-weight: bold; /* Makes the font bold on hover */
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    color: #000;
  }

  .close-button {
    position: fixed;
    top: 10px;
    right: 10px;
    cursor: pointer;
    z-index: 9999;
    text-decoration: none;
    color: #000;
    font-size: 15px;
    font-weight: bold;
  }

  .popup-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    width: 300px; /* optional: define a width for the popup */
  }

  #imageContainer {
    width: 100%;
    text-align: center;
  }

  .custom-image {
    max-width: 100%;
    height: auto;
  }

  .cell {
    position: absolute;
    width: 64px;
    height: 64px;
    z-index: 10;
  }

  .cell .thumbnail {
    width: 100%;
  }

  .cell .empty {
    border: 1px solid grey;
    width: 100%;
    height: 100%;
  }

  .cell.highlighted {
    background-color: green;
  }
  .cell .populated {
    cursor: move;
    border: 1px solid red;
  }

  .thumbnail {
    width: 1%;
  }

  .plant-name {
    position: absolute;
    top: 0;
    text-align: center;
    margin-top: 5px;
  }
</style>

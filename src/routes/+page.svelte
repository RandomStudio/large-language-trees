<script lang="ts">
    import { type SelectPlant } from "../types"; // Assuming type import is correct
    export let data: { seeds: SelectPlant[] };

    import "./main.css";
    import { GRID_HEIGHT, GRID_WIDTH, CELL_SIZE } from "../defaults/constants";
    import PlantCell from "./PlantCell.svelte";

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

<p>Fantasy Garden</p>
<main>
    <div
        class="grid-container"
        style:width={GRID_WIDTH * CELL_SIZE + "px"}
        style:height={GRID_HEIGHT * CELL_SIZE + "px"}
    >
        {#each grid as gridCell}
            <div
                class="cell"
                style:left={gridCell.column * CELL_SIZE + "px"}
                style:top={gridCell.row * CELL_SIZE + "px"}
                style:height={CELL_SIZE + "px"}
                style:width={CELL_SIZE + "px"}
            >
                {#if gridCell.plant}
                    <PlantCell data={gridCell.plant} />
                {/if}
            </div>
        {/each}
    </div>
</main>

<a href="/info" class="hover-bold">?</a>

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

    .draggable .thumbnail {
        width: 100%;
    }
    .thumbnail {
        width: 1%;
    }

    .plant-name {
        text-align: center;
        margin-top: 5px;
    }
</style>

<script lang="ts">
  import { type InsertPlant, type SelectPlant } from "../../lib/types"; // Assuming type import is correct
  export let data: { seeds: SelectPlant[] };
  import { pickMultiple } from "random-elements";

  import "./main.css";
  import { GRID_HEIGHT, GRID_WIDTH, CELL_SIZE } from "../../defaults/constants";
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

  async function confirmBreed(
    parents: [SelectPlant, SelectPlant],
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
    if (plant1.id === plant2.id) {
      return false; // same plant!
    }
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

  function checkAnyCloseTo(plant: SelectPlant) {
    console.log("checkAnyCloseTo");
    const { seeds } = data;
    for (let i = 0; i < seeds.length; i++) {
      if (seeds[i] != plant) {
        const [plant1, plant2] = [plant, seeds[i]];
        if (areClose(plant1, plant2)) {
          candidateParents = [plant1, plant2];
          timeout = setTimeout(() => {
            console.log(
              "ready for mixing : " +
                plant1.commonName +
                " and " +
                plant2.commonName +
                " !",
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
  }

  interface GridCell {
    plant?: SelectPlant;
    highlighted: boolean;
    column: number;
    row: number;
  }

  let grid: GridCell[] = [];

  const populateGrid = () => {
    grid = [];
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
    console.log("drop to grid index", dstIndex);
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
        fetch("/api/plants/" + updatedPlant.id, {
          method: "PATCH",
          body: JSON.stringify(updatedPlant),
        })
          .then((res) => {
            checkAnyCloseTo(updatedPlant);

            if (res.status == 200) {
              console.info("Updated plant position on backend OK:", res);
              invalidateAll();
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
            class:highlight={gridCell.highlighted}
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
      {data}
      closePopup={() => {
        selectedPlant = null;
      }}
    ></PopupInfo>
  {/if}

  {#if candidateChild}
    <ConfirmBreed
      {candidateChild}
      onCancel={() => {
        candidateChild = null;
      }}
      onConfirm={async (imageURL) => {
        if (candidateChild) {
          if (imageURL) {
            console.log("will attach image", imageURL);
            candidateChild.imageUrl = imageURL;
          }
          const res = await fetch("/api/plants", {
            method: "POST",
            body: JSON.stringify(candidateChild),
          });
          const { status, statusText } = res;
          if (status === 201) {
            console.log("Sucessfully added!");
            await invalidateAll();
            populateGrid();
            candidateChild = null;
          } else {
            console.error("Error adding new plant:", { status, statusText });
            candidateChild = null;
          }
        } else {
          console.error(
            "Whoops! Where is the candidate child plant we're confirming?",
          );
        }
      }}
    />
  {/if}

  <a href="/info" class="hover-bold">?</a>

  <!-- <button
    class="debug-button"
    on:click={async () => {
      waitingForGeneration = true;
      const [parent1, parent2] = pickMultiple(data.seeds, 2);
      console.log("random picked:", { parent1, parent2 });
      candidateChild = await confirmBreed([parent1, parent2]);
      waitingForGeneration = false;
    }}>Test breed</button
  > -->
</main>

<a href="/info" class="hover-bold">?</a>
<a href="/landing_page">Landing page</a>

{#if waitingForGeneration}
  <FullScreenLoading />
{/if}

<style>
  main {
    display: flex;
    align-items: center; /* Centers content vertically in the container */
    justify-content: center; /* Centers content horizontally in the container */
    height: 100vh; /* Full viewport height */
    overflow: hidden; /* Hide overflow */
    position: relative; /* Ensures that it is the positioning context for any absolutely positioned children, if needed */
    height: 100vh; /* Takes full viewport height */
    margin: 0; /* Removes default margin */
    padding: 20px; /* Adds padding around the content */
    font-family: Arial, sans-serif; /* Sets the font type to Arial */
    font-size: 15px; /* Sets the font size to 15 */
  }

  .grid-container {
    display: grid;
    position: relative; /* Essential for absolutely positioned children */
    grid-template-columns: repeat(20, 1fr); /* 20 columns */
    grid-template-rows: repeat(20, 1fr); /* 20 rows */
    gap: calc(100% / 21);
    margin: auto; /* Center the container horizontally */
    padding: 10px;
    box-sizing: border-box; /* Include border and padding in the width/height */
    top: -50px;
    overflow: hidden;
  }

  .grid-container::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(circle, #d7d1d1 5%, transparent 5%);
    background-size: calc(100% / 20) calc(100% / 20);
  }

  .cell {
    position: absolute; /* Positioning relative to .grid-container */
    width: 27px; /* Width of each cell */
    height: 27px; /* Height of each cell */
  }

  p {
    text-align: center;
    flex-direction: column; /* Stacks form elements vertically */
    align-items: center; /* Centers form elements horizontally */
    width: 100%; /* Optional: Adjusts form width if necessary */
    max-width: 300px; /* Optional: Restricts form width for better form field alignment */
  }

  input,
  label {
    width: 100%; /* Ensures labels and inputs expand to the width of the form */
    box-sizing: border-box; /* Includes padding and border in the element's total width and height */
    margin-bottom: 10px; /* Adds space between form elements */
  }

  button {
    width: 30%; /* Matches the width of the form elements */
    padding: 5px 0; /* Adds padding for better button size */
    cursor: pointer; /* Indicates the button is clickable */
    text-align: center; /* Ensures the text in the button is centered */
    background-color: white; /* Sets background color to white */
    border: 0.5px solid black; /* Defines border as 0.5 pixels thick, solid, and black */
    border-radius: 1px; /* Sets the border radius to 1 pixel */
    font-family: Arial, sans-serif; /* Explicitly sets the font type to Arial for the button */
    font-size: 15px;
  }

  .hover-bold:hover {
    font-weight: bold; /* Makes the font bold on hover */
  }

  .cell .empty {
    width: 100%;
    height: 100%;
  }

  .cell .highlight {
    border: 1px solid rgb(193, 212, 193);
  }

  .debug-button {
    position: absolute;
    right: 0;
    font-weight: normal; /* Sets font weight to normal, avoiding bold */
  }
</style>

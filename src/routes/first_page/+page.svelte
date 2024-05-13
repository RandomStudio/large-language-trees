<script lang="ts">
    import { onMount } from "svelte";
    import { type SelectPlant } from "../../types"; // Assuming type import is correct
    export let data: { seeds: SelectPlant[] };

    import "./main.css";
    function getOrCreatePopupContainer() {
        // Check if popup container already exists
        let popupContainer = document.querySelector(".popup-container");
        if (!popupContainer) {
            // If not, create a new one
            popupContainer = document.createElement("div");
            popupContainer.classList.add("popup-container");
            popupContainer.style.position = "fixed";
            popupContainer.style.top = "50%";
            popupContainer.style.left = "50%";
            popupContainer.style.transform = "translate(-50%, -50%)";
            popupContainer.style.backgroundColor = "white";
            popupContainer.style.padding = "20px";
            popupContainer.style.borderRadius = "5px";
            popupContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
            popupContainer.style.zIndex = "9999";
            popupContainer.style.display = "none"; // Initially hide the popup container
            document.body.appendChild(popupContainer);

            // Create a message div inside the popup container
            const messageDiv = document.createElement("div");
            popupContainer.appendChild(messageDiv);

            // Create close button (X)
            const closeButton = document.createElement("div");
            closeButton.textContent = "×";
            closeButton.style.position = "absolute";
            closeButton.style.top = "10px";
            closeButton.style.right = "10px";
            closeButton.style.fontSize = "20px";
            closeButton.style.cursor = "pointer";
            closeButton.onclick = function () {
                popupContainer.style.display = "none";
            };
            popupContainer.appendChild(closeButton);
        }

        return popupContainer;
    }

    function showPopup(message) {
        const popupContainer = getOrCreatePopupContainer();
        const messageDiv = popupContainer.querySelector("div");
        messageDiv.textContent = message;
        popupContainer.style.display = "flex";
    }

    onMount(() => {
        function showRedPopup(title, src) {
            const redPopup = document.createElement("div");
            redPopup.style.position = "fixed";
            redPopup.style.top = "0";
            redPopup.style.left = "0";
            redPopup.style.width = "100vw"; // Set width to 100% of viewport width
            redPopup.style.height = "100vh"; // Set height to 100% of viewport height
            redPopup.style.backgroundColor = "white"; // Set red background color
            redPopup.style.zIndex = "9999"; // Set a high z-index to make sure it's above other elements
            redPopup.style.display = "flex";
            redPopup.style.justifyContent = "center";
            redPopup.style.alignItems = "center";

            const contentContainer = document.createElement("div");
            contentContainer.style.textAlign = "center";
            contentContainer.style.color = "black";

            const img = document.createElement("img");
            img.src = src;
            img.alt = title;
            img.style.maxWidth = "80%"; // Adjust image width as needed
            img.style.maxHeight = "60%"; // Adjust image height as needed
            contentContainer.appendChild(img);

            const flowerTitle = document.createElement("h3");
            flowerTitle.textContent = title; // Set flower name as title
            contentContainer.appendChild(flowerTitle);

            const paragraph = document.createElement("p");
            paragraph.textContent = "Placeholder text goes here."; // Add placeholder text
            contentContainer.appendChild(paragraph);

            redPopup.appendChild(contentContainer);

            redPopup.addEventListener("click", function () {
                document.body.removeChild(redPopup);
            });

            document.body.appendChild(redPopup);
        }

        // Generate a set of unique random indices
        function getRandomIndices(max, count) {
            const indices = new Set();
            while (indices.size < count) {
                const randomIndex = Math.floor(Math.random() * max);
                indices.add(randomIndex);
            }
            return Array.from(indices);
        }

        // Create a table from an array by selecting random elements
        function CreateTable(array) {
            const randomIndices = getRandomIndices(array.length, 4);
            return randomIndices.map((index) => array[index]);
        }

        // Create a grid with a specified number of columns and rows
        function createGrid(numColumns = 20, numRows = 20) {
            const gridContainer = document.createElement("div");
            gridContainer.id = "gridContainer";
            gridContainer.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${numColumns}, 1fr);
                grid-template-rows: repeat(${numRows}, 1fr);
                position: absolute;
                left: 20%; top: 20%;
                width: 60%; height: 60%;
                border: 1px solid black;
            `;
            document.body.appendChild(gridContainer);

            for (let y = 0; y < numRows; y++) {
                for (let x = 0; x < numColumns; x++) {
                    const cell = document.createElement("div");
                    cell.style.cssText = `
                        background-color: white;
                        border-right: 1px solid black;
                        border-bottom: 1px solid black;
                    `;
                    cell.dataset.rowIndex = y.toString();
                    cell.dataset.colIndex = x.toString();
                    gridContainer.appendChild(cell);

                    // Attach dragover and drop events to each cell
                    attachDragAndDropHandlers(cell);
                }
            }
            showPopup("Welcome to Fantasy Garden!");
        }

        // Create a flower package with image, alt text, and title
        function createFlowerPackage(flower, src, alt, title) {
            const flowerId =
                "flower-" + Math.random().toString(36).substr(2, 9);
            flower["flowerId"] = flowerId;
            const cell = document.createElement("div");
            cell.style.cssText = `
                position: absolute;
                width: calc(100% / 20);
                height: calc(100% / 20);
                z-index: 10;  // Ensure this is high enough to appear above other grid elements
                draggable: true;
            `;
            cell.classList.add("draggable");
            cell.setAttribute("draggable", "true");
            cell.dataset.flowerId = flowerId;

            const img = document.createElement("img");
            img.src = src;
            img.alt = alt;
            img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
            cell.appendChild(img);

            const titleElement = document.createElement("div");
            titleElement.textContent = title;
            titleElement.style.cssText = "text-align: center; margin-top: 5px;";
            cell.appendChild(titleElement);

            return cell;
        }

        // Attach drag and drop handlers to a cell
        function attachDragAndDropHandlers(cell) {
            cell.addEventListener("dragover", function (event) {
                event.preventDefault(); // Allow dropping
            });

            cell.addEventListener("drop", function (event) {
                event.preventDefault();
                const flowerId = event.dataTransfer.getData("text/plain");
                const flowerElement = document.querySelector(
                    `[data-flower-id="${flowerId}"]`,
                );
                if (flowerElement && cell !== flowerElement.parentNode) {
                    cell.appendChild(flowerElement);
                    const rowIndex = cell.dataset.rowIndex;
                    const colIndex = cell.dataset.colIndex;
                    updateFlowerPosition(
                        flowerId,
                        rowIndex,
                        colIndex,
                        flowersArray,
                    );
                    console.log(rowIndex, colIndex);
                }
            });
        }

        // Initialize flowers and place them on the grid
        function initializeFlowers() {
            const gridSize = 20;
            const uniquePositions = getRandomIndices(
                gridSize * gridSize,
                flowersArray.length,
            );

            flowersArray.forEach((flower, index) => {
                const positionIndex = uniquePositions[index];
                const rowIndex = Math.floor(positionIndex / gridSize);
                const colIndex = positionIndex % gridSize;

                flower.rowIndex = rowIndex;
                flower.colIndex = colIndex;

                const flowerPackage = createFlowerPackage(
                    flower,
                    flower.imageUrl,
                    flower.commonName,
                    flower.commonName,
                );

                flowerPackage.style.zIndex = "9999";

                makeDraggable(flowerPackage);

                // Add click event listener to the flower image
                const img = flowerPackage.querySelector("img");
                img.addEventListener("click", function (event) {
                    const title =
                        flowerPackage.querySelector("div").textContent; // Get the flower title
                    const src = event.target.src; // Get the image source
                    showRedPopup(title, src); // Call showRedPopup with title and src
                });

                const gridContainer = document.getElementById("gridContainer");
                const selector = `div[data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`;
                const cell = gridContainer.querySelector(selector);

                if (cell) {
                    cell.appendChild(flowerPackage);
                } else {
                    console.error(
                        "No cell found at the specified rowIndex and colIndex",
                    );
                }
            });

            enableDropZones();
        }
        function makeDraggable(element) {
            element.setAttribute("draggable", true);
            element.addEventListener("dragstart", function (event) {
                event.dataTransfer.setData(
                    "text/plain",
                    event.target.dataset.flowerId,
                );
                const originalCell = element.closest("div[data-row-index]"); // Get the cell that contains the draggable element
                createEllipse(originalCell); // Create an ellipse at the position of the original cell
            });
        }

        // Enable drop zones for cells
        function enableDropZones() {
            const cells = document.querySelectorAll("#gridContainer div");
            cells.forEach((cell) => {
                cell.addEventListener("dragover", function (event) {
                    event.preventDefault();
                });
                cell.addEventListener("drop", function (event) {
                    event.preventDefault();
                    const flowerId = event.dataTransfer.getData("text/plain");
                    const flowerElement = document.querySelector(
                        `[data-flower-id="${flowerId}"]`,
                    );
                    if (flowerElement && cell !== flowerElement.parentNode) {
                        cell.appendChild(flowerElement);
                        const rowIndex = parseInt(cell.dataset.rowIndex);
                        const colIndex = parseInt(cell.dataset.colIndex);
                        updateFlowerPosition(
                            flowerId,
                            rowIndex,
                            colIndex,
                            flowersArray,
                        );
                        console.log(flowersArray);
                        // Re-vérifiez la proximité après chaque drop
                        checkProximityAndShowPopup(flowersArray);
                    }
                });
            });
        }

        // Update flower position and check for proximity to draw lines
        function updateFlowerPosition(
            flowerId,
            rowIndex,
            colIndex,
            flowersArray,
        ) {
            rowIndex = parseInt(rowIndex);
            colIndex = parseInt(colIndex);
            console.log(flowersArray);
            const flower = flowersArray.find((f) => f.flowerId === flowerId);
            console.log(flower);
            if (flower) {
                flower.rowIndex = rowIndex;
                flower.colIndex = colIndex;

                // Appel de la vérification de proximité pour la fleur déplacée
                checkProximityForFlower(flower, flowersArray);
                console.log("OK");
            }
        }

        function showPopup(message) {
            const popup = document.createElement("div");
            popup.style.position = "fixed";
            popup.style.top = "50%";
            popup.style.left = "50%";
            popup.style.transform = "translate(-50%, -50%)";
            popup.style.padding = "20px";
            popup.style.backgroundColor = "white";
            popup.style.border = "1px solid black";
            popup.style.zIndex = "1000"; // Assurez-vous qu'il est bien au-dessus des autres éléments
            popup.textContent = message;

            document.body.appendChild(popup);

            // Ajouter un timer pour faire disparaître le popup après quelques secondes
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 3000); // Le popup disparaît après 3 secondes
        }

        function setupSVG() {
            const svgNamespace = "http://www.w3.org/2000/svg";
            const sprayArea = document.createElementNS(svgNamespace, "svg");
            sprayArea.style.width = "100vw";
            sprayArea.style.height = "100vh";
            sprayArea.style.position = "absolute";
            sprayArea.style.top = "0";
            sprayArea.style.left = "0";
            document.body.appendChild(sprayArea);
            return sprayArea;
        }

        function checkProximityForFlower(movedFlower, flowersArray) {
            flowersArray.forEach((flower) => {
                if (
                    flower.flowerId !== movedFlower.flowerId &&
                    areFlowersClose(movedFlower, flower)
                ) {
                    console.log("Les fleurs sont à côté:", movedFlower, flower);
                    showPopup("Creating a Flower...");
                }
            });
        }

        function animateDots(flower1, flower2, svgArea) {
            const svgNamespace = "http://www.w3.org/2000/svg";
            const numDots = 10; // Adjust the number of dots based on your preference
            const dots = [];

            // Calculate starting and ending coordinates based on grid positioning
            const x1 =
                flower1.colIndex * (gridContainer.offsetWidth / 20) +
                gridContainer.offsetWidth / 40;
            const y1 =
                flower1.rowIndex * (gridContainer.offsetHeight / 20) +
                gridContainer.offsetHeight / 40;
            const x2 =
                flower2.colIndex * (gridContainer.offsetWidth / 20) +
                gridContainer.offsetWidth / 40;
            const y2 =
                flower2.rowIndex * (gridContainer.offsetHeight / 20) +
                gridContainer.offsetHeight / 40;

            // Create dots at intervals between the two flowers
            for (let i = 0; i < numDots; i++) {
                const t = i / numDots;
                const x = x1 * (1 - t) + x2 * t;
                const y = y1 * (1 - t) + y2 * t;
                const dot = document.createElementNS(svgNamespace, "circle");
                dot.setAttribute("cx", x);
                dot.setAttribute("cy", y);
                dot.setAttribute("r", 3);
                dot.setAttribute(
                    "fill",
                    `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.7)`,
                );
                svgArea.appendChild(dot);
                dots.push(dot);
            }

            // Function to animate dots
            function animate() {
                dots.forEach((dot) => {
                    let x = parseFloat(dot.getAttribute("cx"));
                    let y = parseFloat(dot.getAttribute("cy"));
                    const dx = (Math.random() - 0.5) * 2;
                    const dy = (Math.random() - 0.5) * 2;
                    x += dx;
                    y += dy;
                    dot.setAttribute("cx", x);
                    dot.setAttribute("cy", y);
                });
                requestAnimationFrame(animate);
            }

            requestAnimationFrame(animate);
        }

        function checkProximityAndShowPopup(flowersArray) {
            let popupShown = false; // A flag to ensure only one popup is shown at a time

            for (let i = 0; i < flowersArray.length; i++) {
                for (let j = i + 1; j < flowersArray.length; j++) {
                    if (areFlowersClose(flowersArray[i], flowersArray[j])) {
                        if (!popupShown) {
                            // If no popup has been shown yet
                            showPopup("Creating a Flower...");
                            popupShown = true; // Set the flag to true
                        }
                        // Trigger the animation between the two close flowers
                        animateDots(flowersArray[i], flowersArray[j], svgArea);
                    }
                }
            }
        }

        // Check if two flower packages are close to each other
        function areFlowersClose(flower1, flower2) {
            const rowDiff = Math.abs(flower1.rowIndex - flower2.rowIndex);
            const colDiff = Math.abs(flower1.colIndex - flower2.colIndex);
            return (
                (rowDiff <= 1 && colDiff === 0) ||
                (rowDiff === 0 && colDiff <= 1)
            );
        }

        // Draw a line between two close flower packages
        function drawLineBetweenFlowers(flower1, flower2) {
            const gridContainer = document.getElementById("gridContainer");
            let svg = document.getElementById("lineSvg");
            if (!svg) {
                svg = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "svg",
                );
                svg.setAttribute("id", "lineSvg");
                svg.style.position = "absolute";
                svg.style.top = "0";
                svg.style.left = "0";
                svg.style.width = "100%";
                svg.style.height = "100%";
                svg.style.zIndex = "1000"; // Ensure the z-index is high enough to appear above all other elements
                gridContainer.appendChild(svg);
            }

            const x1 =
                flower1.colIndex * (gridContainer.offsetWidth / 20) +
                gridContainer.offsetWidth / 40;
            const y1 =
                flower1.rowIndex * (gridContainer.offsetHeight / 20) +
                gridContainer.offsetHeight / 40;
            const x2 =
                flower2.colIndex * (gridContainer.offsetWidth / 20) +
                gridContainer.offsetWidth / 40;
            const y2 =
                flower2.rowIndex * (gridContainer.offsetHeight / 20) +
                gridContainer.offsetHeight / 40;

            const line = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line",
            );
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("stroke", "red");
            line.setAttribute("stroke-width", "2");
            svg.appendChild(line);
        }

        let flowersArray = CreateTable(data.seeds);
        console.log(flowersArray);
        createGrid();
        initializeFlowers();
        //checkAndDrawLines(flowersArray);
        //checkProximityAndShowPopup(flowersArray);
    });
</script>

<a href="first_page/infoplant">Infoplant</a>

<svelte:head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
</svelte:head>

<main>
    <h1>Fantasy Garden</h1>
    <a href="first_page/info" class="hover-bold">?</a>
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
</style>

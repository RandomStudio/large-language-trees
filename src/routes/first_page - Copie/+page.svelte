<script lang="ts">
    import { onMount } from "svelte";

    import { type InsertPlant, type SelectPlant } from "../../types";
    export let data: { seeds: SelectPlant[] };

    import "./main.css";
    import { Table } from "drizzle-orm";
    import { isRunnableFunctionWithParse } from "openai/lib/RunnableFunction.mjs";

    onMount(() => {
        function getRandomIndices(max, count) {
            const indices = new Set();
            while (indices.size < count) {
                const randomIndex = Math.floor(Math.random() * max);
                indices.add(randomIndex);
            }
            return Array.from(indices);
        }
        function CreateTable(array) {
            const randomIndices = getRandomIndices(array.length, 4);
            return randomIndices.map((index) => array[index]);
        }

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
                }
            }
        }

        function createFlowerPackage(src, alt, title) {
            const cell = document.createElement("div");
            cell.style.cssText = `
        position: absolute;
        width: calc(100% / 20);
        height: calc(100% / 20);
        z-index: 10;  // Assurez-vous que cela soit suffisant pour surpasser toute autre valeur dans la grille
        draggable: true;
    `;
            cell.classList.add("draggable");

            const flowerId =
                "flower-" + Math.random().toString(36).substr(2, 9);
            cell.dataset.flowerId = flowerId;

            const img = document.createElement("img");
            img.src = src;
            img.alt = alt;
            img.style.cssText = `
        width: 100%; height: 100%;
        object-fit: cover;
    `;
            cell.appendChild(img);

            const titleElement = document.createElement("div");
            titleElement.textContent = title;
            titleElement.style.cssText = `
        text-align: center;
        margin-top: 5px;
    `;
            cell.appendChild(titleElement);

            return cell;
        }
        function initializeFlowers(flowersArray) {
            createGrid(); // Assurez-vous que la grille est déjà créée

            // Générez des indices aléatoires uniques pour chaque fleur, avec une grille de 20x20
            const gridSize = 20;
            const uniquePositions = getRandomIndices(
                gridSize * gridSize,
                flowersArray.length,
            );

            flowersArray.forEach((flower, index) => {
                const positionIndex = uniquePositions[index];
                const rowIndex = Math.floor(positionIndex / gridSize);
                const colIndex = positionIndex % gridSize;

                // Ajoutez les indices de ligne et de colonne à l'objet flower
                flower.rowIndex = rowIndex;
                flower.colIndex = colIndex;

                // Créer et placer le flower package
                const flowerPackage = createFlowerPackage(
                    flower.imageUrl,
                    flower.commonName,
                    flower.commonName,
                );
                flowerPackage.dataset.flowerId =
                    "flower-" + Math.random().toString(36).substr(2, 9); // Générer un ID unique
                flowerPackage.dataset.rowIndex = rowIndex; // Stocker les informations de ligne et colonne
                flowerPackage.dataset.colIndex = colIndex;

                makeDraggable(flowerPackage); // Rendre l'élément draggable

                // Placer le flower package dans la cellule spécifiée
                const gridContainer = document.getElementById("gridContainer");
                const cells = gridContainer.querySelectorAll("div");
                const cell = cells[positionIndex]; // Sélectionner la cellule basée sur l'index calculé
                cell.appendChild(flowerPackage);
            });

            enableDropZones(); // Activer les zones de drop pour les cellules
        }
        function placeFlowerRandomly(src, alt, title, cellIndex) {
            const gridContainer = document.getElementById("gridContainer");
            const cells = gridContainer.querySelectorAll("div");

            // Sélectionner la cellule spécifique en utilisant l'index unique
            let randomCell = cells[cellIndex];

            // Créer le package de fleurs
            const flowerPackage = createFlowerPackage(src, alt, title);

            // Placer le package de fleurs dans la cellule sélectionnée
            randomCell.appendChild(flowerPackage);

            // Calculer les coordonnées pour le retour (si nécessaire)
            const numColumns = 20; // Nombre de colonnes dans la grille
            const rowIndex = Math.floor(cellIndex / numColumns); // Calcul de l'indice de ligne
            const colIndex = cellIndex % numColumns; // Calcul de l'indice de colonne

            return [rowIndex, colIndex];
        }

        function makeDraggable(element) {
            element.setAttribute("draggable", true);
            element.addEventListener("dragstart", function (event) {
                event.dataTransfer.setData(
                    "text/plain",
                    event.target.dataset.flowerId,
                );
            });
        }

        function enableDropZones() {
            const cells = document.querySelectorAll("#gridContainer div");
            cells.forEach((cell) => {
                cell.addEventListener("dragover", function (event) {
                    event.preventDefault(); // Permettre le drop
                });
                cell.addEventListener("drop", function (event) {
                    event.preventDefault();
                    const flowerId = event.dataTransfer.getData("text/plain");
                    const flowerElement = document.querySelector(
                        `[data-flower-id="${flowerId}"]`,
                    );
                    if (flowerElement && cell !== flowerElement.parentNode) {
                        // Éviter de redéposer sur la même cellule
                        cell.appendChild(flowerElement); // Déplacer l'élément
                        const rowIndex = cell.dataset.rowIndex;
                        const colIndex = cell.dataset.colIndex;
                        updateFlowerPosition(flowerId, rowIndex, colIndex);
                    }
                });
            });
        }

        function updateFlowerPosition(flowerId, rowIndex, colIndex) {
            rowIndex = parseInt(rowIndex);
            colIndex = parseInt(colIndex);
            const flower = flowersArray.find((f) => f.flowerId === flowerId);
            if (flower) {
                flower.rowIndex = rowIndex;
                flower.colIndex = colIndex;
            }
        }

        console.log(data.seeds);
        let flowersArray = CreateTable(data.seeds);
        console.log(flowersArray);
        createGrid();
        initializeFlowers(flowersArray);
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

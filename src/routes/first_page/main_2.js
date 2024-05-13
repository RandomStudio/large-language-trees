//Setup Variables

const flowerPackages = [
    { src: 'newplantpng.png', alt: 'New Plant', title: 'New Plant' },
    { src: 'rose.png', alt: 'Rose', title: 'Rose' },
    { src: 'rose.png', alt: 'Tulip', title: 'Tulip' },
    { src: 'rose.png', alt: 'Daisy', title: 'Daisy' }
];
const flowerWidth = 50; // Width of the flower images, used in positioning and radius calculations
const noOverlapRadius = flowerWidth / 2 + 10; // Minimum distance to prevent overlap

const connectionMinRadius = 60; // Minimum distance for a "connection"
const connectionMaxRadius = 100; // Maximum radius to log "connection"
const collisionRadius = noOverlapRadius;

let flowerPackageCounter = 0;
let flowerPositions = []; // This will hold the positions of all flower packages

//Popup white

function getOrCreatePopupContainer() {
    let popupContainer = document.getElementById('popupContainer');
    if (!popupContainer) {
        popupContainer = document.createElement('div');
        popupContainer.id = 'popupContainer';
        popupContainer.style.position = 'fixed';
        popupContainer.style.top = '0';
        popupContainer.style.left = '0';
        popupContainer.style.width = '100%';
        popupContainer.style.height = '100%';
        popupContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
        popupContainer.style.display = 'none';
        popupContainer.style.justifyContent = 'center';
        popupContainer.style.alignItems = 'center';
        popupContainer.style.zIndex = '1000';
        document.body.appendChild(popupContainer);

        const messageDiv = document.createElement('div');
        messageDiv.style.padding = '20px';
        messageDiv.style.backgroundColor = '#fff';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.position = 'relative';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.color = '#000';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function() {
            popupContainer.style.display = 'none';
        };
        messageDiv.appendChild(closeButton);
        popupContainer.appendChild(messageDiv);
    }
    return popupContainer;
}

function showPopup(message) {
    const maxWidth = 200; // Maximum width for the popup container
    const popupContainer = getOrCreatePopupContainer();
    const messageDiv = popupContainer.querySelector('div');
    
    // Set message content
    if (messageDiv.childNodes.length > 1) {
        messageDiv.childNodes[0].nodeValue = message; // Update existing text node
    } else {
        messageDiv.textContent = message; // Set message as text content
    }
    
    // Calculate width and height based on message length
    const messageWidth = Math.min(maxWidth, messageDiv.getBoundingClientRect().width);
    const messageHeight = messageDiv.getBoundingClientRect().height;
    
    // Set width and height of popup container
    const adjustedWidth = Math.max(messageWidth, 150); // Adjusted width to ensure readability
    popupContainer.style.width = adjustedWidth + 'px';
    popupContainer.style.height = 'auto'; // Set height to auto to fit the content
    
    // Center the popup container horizontally and vertically
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const leftPosition = (screenWidth - adjustedWidth) / 2;
    const topPosition = (screenHeight - messageHeight) / 2; // Center vertically
    
    popupContainer.style.left = leftPosition + 'px';
    popupContainer.style.top = topPosition + 'px'; // Set adjusted top position
    
    // Check if close button already exists
    if (!messageDiv.querySelector('button')) {
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px'; // Increased top position for more space
        closeButton.style.right = '10px'; // Adjusted right position
        closeButton.style.marginLeft = '10px'; // Add margin to the left
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.color = '#000';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function() {
            popupContainer.style.display = 'none';
        };
        messageDiv.appendChild(closeButton); // Append to message div instead of popup container
    }
    
    popupContainer.style.display = 'flex';
}

function closePopup() {
    const popupContainer = document.getElementById('popupContainer');
    if (popupContainer) {
        popupContainer.style.display = 'none';
    } else {
    }
}

function createGrid() {
    const cellSize = 30; // Each cell is 30px by 30px
    const numColumns = 20; // Calculate number of columns based on window width
    const numRows = 20; // Calculate number of rows based on window height

    const gridContainer = document.createElement('div');
    gridContainer.id = 'gridContainer';
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${numColumns}, ${cellSize}px)`; // Set column template
    gridContainer.style.gridTemplateRows = `repeat(${numRows}, ${cellSize}px)`; // Set row template
    gridContainer.style.position = 'absolute';
    gridContainer.style.left = '0';
    gridContainer.style.top = '0';
    gridContainer.style.width = '100%'; // Span entire window width
    gridContainer.style.height = '100%'; // Span entire window height
    gridContainer.style.border = '1px solid black'; // Add border to separate cells
    document.body.appendChild(gridContainer);

    // Create grid cells
    for (let y = 0; y < numRows; y++) {
        for (let x = 0; x < numColumns; x++) {
            const cell = document.createElement('div');
            cell.style.backgroundColor = 'white';
            cell.style.borderRight = '1px solid black'; // Add right border
            cell.style.borderBottom = '1px solid black'; // Add bottom border
            gridContainer.appendChild(cell);
        }
    }
}

//Popup Yellow Info Flowers

function showRedPopup(title, src) {
    const redPopup = document.createElement('div');
    redPopup.style.position = 'fixed';
    redPopup.style.top = '0';
    redPopup.style.left = '0';
    redPopup.style.width = '100%';
    redPopup.style.height = '100%';
    redPopup.style.backgroundColor = 'yellow';
    redPopup.style.color = 'white';
    redPopup.style.display = 'flex';
    redPopup.style.flexDirection = 'column';
    redPopup.style.justifyContent = 'center';
    redPopup.style.alignItems = 'center';

    // Create title element
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    redPopup.appendChild(titleElement);

    // Create image element
    const img = document.createElement('img');
    img.src = src; // Set the image source dynamically when a flower is clicked
    img.alt = title; // Use the title as alt text
    img.style.width = '200px'; // Adjust image size as needed
    img.style.height = 'auto';
    redPopup.appendChild(img);

    // Create paragraph element
    const paragraph = document.createElement('p');
    paragraph.textContent = 'This is a placeholder paragraph. You can customize it as needed.';
    redPopup.appendChild(paragraph);

    // Add event listener to remove the red popup when clicked
    redPopup.addEventListener('click', function() {
        document.body.removeChild(redPopup);
    });

    document.body.appendChild(redPopup);
}

//Flower
//position into grid
function createFlowerPackage(src, alt, title, x, y) {
    const cellSize = 30; // Each cell is 30x30 pixels
    const gridStartX = 50; // Adjust this to match the starting x position of your grid
    const gridStartY = 50; // Adjust this to match the starting y position of your grid

    // Calculate the grid cell that the flower package belongs to
    const cellX = Math.floor((x - gridStartX) / cellSize);
    const cellY = Math.floor((y - gridStartY) / cellSize);

    // Calculate the adjusted position within the grid cell
    const adjustedX = gridStartX + cellX * cellSize;
    const adjustedY = gridStartY + cellY * cellSize;

    // Check if there's already a flower package in this cell
    if (flowerPositions.some(pos => pos.x === adjustedX && pos.y === adjustedY)) {
        console.log("A flower package already exists in this cell.");
        return null; // Abort creation
    }

    const cell = document.createElement('div');
    cell.id = `flowerpackage${flowerPackageCounter}`; // Unique ID based on flowerPackageCounter
    cell.style.position = 'absolute';
    cell.style.left = `${adjustedX}px`;
    cell.style.top = `${adjustedY}px`;
    cell.draggable = true;
    cell.style.cursor = 'grab';

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.width = '30px'; // Set the width to 30px
    img.style.height = '30px'; // Set the height to 30px
    img.style.position = 'absolute';
    img.style.left = '0';
    img.style.top = '0';

    const titleElement = document.createElement('div');
    titleElement.textContent = title;
    titleElement.style.textAlign = 'center';

    cell.appendChild(img);
    cell.appendChild(titleElement);

    // Update flower position
    flowerPositions.push({ id: cell.id, x: adjustedX, y: adjustedY });

    return cell;
}

function addFlowerPackage(src, alt, title, x, y) {
    const gridContainer = document.getElementById('gridContainer');
    const cell = createFlowerPackage(src, alt, title, x, y);
    gridContainer.appendChild(cell);

    flowerPositions.push({ id: cell.id, x: x, y: y });  // Initialize position

    // Add event listeners for drag and click interactions
    addEventListeners(cell, gridContainer, src, title);
}

function addEventListeners(cell, gridContainer, src, title) {
    let startPos = { x: 0, y: 0 };
    cell.addEventListener('dragstart', function(event) {
        startPos = { x: parseInt(cell.style.left, 10), y: parseInt(cell.style.top, 10) }; // Capture exact starting position
        event.dataTransfer.setData('text/plain', cell.id);
        event.dataTransfer.setDragImage(cell.querySelector('img'), 0, 0);
    });

    cell.addEventListener('dragend', function(event) {
        handleDragEnd(event, cell, gridContainer, startPos);
    });

    const img = cell.querySelector('img');
    img.addEventListener('click', function(event) {
        showRedPopup(title, src);
    });
}

function handleDragEnd(event, cell, gridContainer, startPos) {
    const gridRect = gridContainer.getBoundingClientRect();
    const gridStartX = gridRect.left + 50; // Adjust for grid start position
    const gridStartY = gridRect.top + 50; // Adjust for grid start position

    const newLeft = event.clientX - gridStartX - flowerWidth / 2; // Center the flower on the cursor
    const newTop = event.clientY - gridStartY - flowerWidth / 2;

    console.log(`New position: (${newLeft}, ${newTop})`);

    // Before finalizing the new position, check for potential collisions
    if (!checkForCollision(cell.id, newLeft, newTop, collisionRadius + flowerWidth / 2)) {
        cell.style.left = `${newLeft}px`;
        cell.style.top = `${newTop}px`;
        updateFlowerPosition(cell.id, newLeft, newTop);
        createSVG(startPos.x, startPos.y, gridContainer); // Place SVG at the start position
        checkProximity(); // Trigger the proximity check after dragging
    } else {
        // If a collision is detected, revert to the original position
        cell.style.left = `${startPos.x}px`;
        cell.style.top = `${startPos.y}px`;
    }
}

function updateFlowerPosition(id, x, y) {
    let found = false;
    flowerPositions = flowerPositions.map(pos => {
        if (pos.id === id) {
            found = true;
            return { id, x, y };
        }
        return pos;
    });

    if (!found) {
        console.error("Flower package not found in positions, adding new.");
        flowerPositions.push({ id, x, y });
    }
}

function setupFlowerPackages(numColumns, numRows) {
    const gridContainer = document.getElementById('gridContainer');
    const gridRect = gridContainer.getBoundingClientRect();
    const gridStartX = 50; // Adjust this to match the starting x position of your grid
    const gridStartY = 50; // Adjust this to match the starting y position of your grid
    const cellSize = 30; // Size of each cell in the grid

    // Calculate the maximum x and y coordinates to ensure flower packages are placed in the middle of the grid
    const maxX = gridRect.width - 100; // Adjust for grid start and end position
    const maxY = gridRect.height - 100; // Adjust for grid start and end position

    flowerPackages.forEach((pkg, index) => {
        // Calculate a random grid cell within the grid boundaries
        const randomCellX = Math.floor(Math.random() * (numColumns - 1)) + 1; // Avoid placing in the first column
        const randomCellY = Math.floor(Math.random() * (numRows - 1)) + 1; // Avoid placing in the first row

        // Calculate the random position within the selected cell
        const randomX = gridStartX + randomCellX * cellSize;
        const randomY = gridStartY + randomCellY * cellSize;

        addFlowerPackage(pkg.src, pkg.alt, pkg.title, randomX, randomY);
    });
}

function logConnectingPlants(connectionKey) {
    if (!connectionKey) {
        console.error('logConnectingPlants was called without a connectionKey.');
        return;
    }

    const ids = connectionKey.split('-');
    const plant1 = flowerPositions.find(pos => pos.id === ids[0]);
    const plant2 = flowerPositions.find(pos => pos.id === ids[1]);

    if (plant1 && plant2) {
        console.log(`Connection logged: ${ids[0]} at (${plant1.x}, ${plant1.y}) and ${ids[1]} at (${plant2.x}, ${plant2.y})`);
    } else {
        console.error('Error: One or both plant IDs not found.');
    }
}

function getTitle(id) {
    // Extract the title from the flower ID
    return flowerPositions.find(pos => pos.id === id)?.title || id;
}

//Ellipse left behind

function createSVG(x, y, container) {
    let svgNS = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(svgNS, "svg");
    svg.style.position = 'absolute';
    svg.style.left = `${x}px`;
    svg.style.top = `${y}px`;
    svg.style.width = '50px';
    svg.style.height = '30px';

    let ellipse = document.createElementNS(svgNS, "ellipse");
    ellipse.setAttribute("cx", "25px"); // Set the center x-coordinate to half the width
    ellipse.setAttribute("cy", "15px"); // Set the center y-coordinate to half the height
    ellipse.setAttribute("rx", "20px"); // Set the horizontal radius
    ellipse.setAttribute("ry", "10px"); // Set the vertical radius
    ellipse.setAttribute("fill", "black");

    let filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", "dropShadow");

    let feOffset = document.createElementNS(svgNS, "feOffset");
    feOffset.setAttribute("dx", "2");
    feOffset.setAttribute("dy", "2");
    filter.appendChild(feOffset);

    let feGaussianBlur = document.createElementNS(svgNS, "feGaussianBlur");
    feGaussianBlur.setAttribute("stdDeviation", "2");
    filter.appendChild(feGaussianBlur);

    let feBlend = document.createElementNS(svgNS, "feBlend");
    feBlend.setAttribute("in", "SourceGraphic");
    filter.appendChild(feBlend);

    svg.appendChild(filter);
    ellipse.style.filter = "url(#dropShadow)";

    svg.appendChild(ellipse);
    container.appendChild(svg);
}

//Connection Line

function createSVGLine(x1, y1, x2, y2) {
    let svgNS = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(svgNS, "svg");
    svg.style.position = 'absolute';
    svg.style.zIndex = '999';
    svg.style.pointerEvents = 'none'; // Make the SVG non-interactive
    svg.style.width = '100%';
    svg.style.height = '100%';

    let line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1 + flowerWidth / 2); // Start from the center of the first flower image
    line.setAttribute("y1", y1 + flowerWidth / 2);
    line.setAttribute("x2", x2 + flowerWidth / 2); // End at the center of the second flower image
    line.setAttribute("y2", y2 + flowerWidth / 2);
    line.setAttribute("stroke", "pink");
    line.setAttribute("stroke-width", "2");

    svg.appendChild(line);
    document.body.appendChild(svg);
}

window.onload = function() {
    showPopup("You start with four plants. Dig them out and move them towards each other to create new plants!");
    createGrid();
    setupFlowerPackages(7, 7); // Pass the number of columns and rows
    checkProximity();
}

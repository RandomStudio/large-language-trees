// Function to close the popup
function closePopup() {
    const popupContainer = document.getElementById('popupContainer');
    if (popupContainer) {
        popupContainer.style.display = 'none';
    } else {
    }
}

// Ensures the popup container is either retrieved or created if it doesn't exist.
// Ensures the popup container is either retrieved or created if it doesn't exist.
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
        closeButton.onclick = function () {
            if (popupContainer !== null) {
                popupContainer.style.display = 'none';
            }
        };
        messageDiv.appendChild(closeButton);
        popupContainer.appendChild(messageDiv);
    }
    return popupContainer;
}

export function showPopup(message) {
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
        closeButton.onclick = function () {
            popupContainer.style.display = 'none';
        };
        messageDiv.appendChild(closeButton); // Append to message div instead of popup container
    }

    popupContainer.style.display = 'flex';
}

export function createGrid() {
    const gridContainer = document.createElement('div');
    gridContainer.id = 'gridContainer';
    gridContainer.style.position = 'absolute';
    gridContainer.style.width = '80vw';
    gridContainer.style.height = '80vh';
    gridContainer.style.top = '50%';
    gridContainer.style.left = '50%';
    gridContainer.style.transform = 'translate(-50%, -50%)';
    gridContainer.style.border = '1px solid black';
    document.body.appendChild(gridContainer);

    // Allow dropping by preventing the default behavior on dragover
    gridContainer.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    gridContainer.addEventListener('drop', function (event) {
        event.preventDefault();
        const data = event.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(data);
        const gridRect = gridContainer.getBoundingClientRect();
        draggedElement.style.left = (event.clientX - gridRect.left) + 'px';
        draggedElement.style.top = (event.clientY - gridRect.top) + 'px';
        gridContainer.appendChild(draggedElement);
    });
}

let flowerPositions = [];
let connections = [];

function addFlowerPackage(src, alt, title, x, y) {
    const gridContainer = document.getElementById('gridContainer');
    const cell = createFlowerPackage(src, alt, title, x, y);
    gridContainer.appendChild(cell);

    flowerPositions.push({ id: cell.id, x: x * 100, y: y * 100 });  // Initialize position

    // Add event listeners for drag and click interactions
    addEventListeners(cell, gridContainer, src, title);
}

const flowerWidth = 50; // Width of the flower images, used in positioning and radius calculations
const noOverlapRadius = flowerWidth / 2 + 10; // 35px: half the width plus 10px buffer to prevent overlap
const connectionMinRadius = 60; // Minimum distance for a "connection"
const connectionMaxRadius = 100; // Maximum radius to log "connection"
const collisionRadius = noOverlapRadius;

function addEventListeners(cell, gridContainer, src, title) {
    let startPos = { x: 0, y: 0 };
    cell.addEventListener('dragstart', function (event) {
        startPos = { x: parseInt(cell.style.left, 10), y: parseInt(cell.style.top, 10) }; // Capture exact starting position
        event.dataTransfer.setData('text/plain', cell.id);
        event.dataTransfer.setDragImage(cell.querySelector('img'), 0, 0);
    });

    cell.addEventListener('dragend', function (event) {
        handleDragEnd(event, cell, gridContainer, startPos);
    });

    const img = cell.querySelector('img');
    img.addEventListener('click', function (event) {
        showRedPopup(title, src);
    });
}

function handleDragEnd(event, cell, gridContainer, startPos) {
    const gridRect = gridContainer.getBoundingClientRect();
    const newLeft = event.clientX - gridRect.left - flowerWidth / 2;
    const newTop = event.clientY - gridRect.top - flowerWidth / 2;

    if (!checkForCollision(cell.id, newLeft, newTop, collisionRadius)) {
        cell.style.left = `${newLeft}px`;
        cell.style.top = `${newTop}px`;
        updateFlowerPosition(cell.id, newLeft, newTop);
        checkProximity(cell.id, newLeft, newTop); // Now updates and checks proximity in the new position
    } else {
        // Revert to original if collision
        cell.style.left = `${startPos.x}px`;
        cell.style.top = `${startPos.y}px`;
        // Optionally, recheck positions here if needed
    }
}

function checkForCollision(currentId, currentX, currentY, radius) {
    return flowerPositions.some(pos => {
        if (pos.id !== currentId) {
            const dx = pos.x - currentX;
            const dy = pos.y - currentY;
            return Math.sqrt(dx * dx + dy * dy) < radius;
        }
        return false;
    });
}

function createFlowerPackage(src, alt, title, x, y) {
    const cell = document.createElement('div');
    cell.id = `cell-${x}-${y}`;
    cell.style.position = 'absolute';
    cell.style.left = `${x * 100}px`;
    cell.style.top = `${y * 100}px`;
    cell.draggable = true;
    cell.style.cursor = 'grab';

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.width = '40px';

    const titleElement = document.createElement('div');
    titleElement.textContent = title;
    titleElement.style.textAlign = 'center';

    cell.appendChild(img);
    cell.appendChild(titleElement);

    return cell;
}

function addEventListeners(cell, gridContainer, src, title) {
    let startPos = { x: 0, y: 0 };
    cell.addEventListener('dragstart', function (event) {
        startPos = { x: parseInt(cell.style.left, 10), y: parseInt(cell.style.top, 10) }; // Capture exact starting position
        event.dataTransfer.setData('text/plain', cell.id);
        event.dataTransfer.setDragImage(cell.querySelector('img'), 0, 0);
    });

    cell.addEventListener('drag', function (event) {
        // Update the flower position during dragging
        const gridRect = gridContainer.getBoundingClientRect();
        const newLeft = event.clientX - gridRect.left - flowerWidth / 2;
        const newTop = event.clientY - gridRect.top - flowerWidth / 2;
        cell.style.left = `${newLeft}px`;
        cell.style.top = `${newTop}px`;
        // Trigger the proximity check
        checkProximity(cell.id, newLeft, newTop);
    });

    cell.addEventListener('dragend', function (event) {
        handleDragEnd(event, cell, gridContainer, startPos);
    });

    const img = cell.querySelector('img');
    img.addEventListener('click', function (event) {
        showRedPopup(title, src);
    });
}

function handleDragEnd(event, cell, gridContainer, startPos) {
    const gridRect = gridContainer.getBoundingClientRect();
    const newLeft = event.clientX - gridRect.left - flowerWidth / 2; // Center the flower on the cursor
    const newTop = event.clientY - gridRect.top - flowerWidth / 2;

    // Before finalizing the new position, check for potential collisions
    if (!checkForCollision(cell.id, newLeft, newTop, collisionRadius + flowerWidth / 2)) {
        cell.style.left = `${newLeft}px`;
        cell.style.top = `${newTop}px`;
        updateFlowerPosition(cell.id, newLeft, newTop);
        createSVG(startPos.x, startPos.y, gridContainer); // Place SVG at the start position
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

// Initially populate positions that should connect
flowerPositions = [
    { id: 'flower1', x: 100, y: 100 },
    { id: 'flower2', x: 150, y: 150 }  // Close enough to connect based on your radius criteria
];

// Manually call checkProximity on one of these to force a check
checkProximity('flower1', 100, 100);



function checkProximity(currentId, currentX, currentY) {
    flowerPositions.forEach(pos => {
        if (pos.id !== currentId) {
            const dx = pos.x - currentX;
            const dy = pos.y - currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance >= connectionMinRadius && distance <= connectionMaxRadius) {
                const connectionKey = [currentId, pos.id].sort().join('-');
                if (!connections.includes(connectionKey)) {
                    connections.push(connectionKey);
                    console.log(`Connection made between ${currentId} at (${currentX}, ${currentY}) and ${pos.id} at (${pos.x}, ${pos.y})`);
                    createSVGLine(currentX, currentY, pos.x, pos.y);
                }
            }
        }
    });
}

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
    redPopup.addEventListener('click', function () {
        document.body.removeChild(redPopup);
    });

    document.body.appendChild(redPopup);
}

// Setup initial flower packages in the grid
export function setupFlowerPackages() {
    const flowerPackages = [
        { src: 'newplantpng.png', alt: 'New Plant', title: 'New Plant', x: 1, y: 1 },
        { src: 'rose.png', alt: 'Rose', title: 'Rose', x: 2, y: 1 },
        { src: 'tulip.png', alt: 'Tulip', title: 'Tulip', x: 1, y: 2 },
        { src: 'daisy.png', alt: 'Daisy', title: 'Daisy', x: 2, y: 2 }
    ];

    flowerPackages.forEach(pkg => {
        addFlowerPackage(pkg.src, pkg.alt, pkg.title, pkg.x * 100, pkg.y * 100);
    });
}


function showRedPopup(title, src) {
    const redPopup = document.createElement('div');
    redPopup.style.position = 'fixed';
    redPopup.style.top = '0';
    redPopup.style.left = '0';
    redPopup.style.width = '100%';
    redPopup.style.height = '100%';
    redPopup.style.backgroundColor = 'yellow';
    redPopup.style.color = 'black';
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
    redPopup.addEventListener('click', function () {
        document.body.removeChild(redPopup);
    });

    document.body.appendChild(redPopup);
}

// Setup initial flower packages in the grid
function setupFlowerPackages() {
    const flowerPackages = [
        { src: 'newplantpng.png', alt: 'New Plant', title: 'New Plant', x: 1, y: 1 },
        { src: 'rose.png', alt: 'Rose', title: 'Rose', x: 2, y: 1 },
        { src: 'rose.png', alt: 'Tulip', title: 'Tulip', x: 1, y: 2 },
        { src: 'rose.png', alt: 'Daisy', title: 'Daisy', x: 2, y: 2 }
    ];

    flowerPackages.forEach(pkg => {
        addFlowerPackage(pkg.src, pkg.alt, pkg.title, pkg.x, pkg.y);
    });
}

export function testProximity() {
    flowerPositions.push({ id: 'test1', x: 100, y: 100 });
    flowerPositions.push({ id: 'test2', x: 160, y: 160 }); // Adjust these values to fit within the connection range
    checkProximity('test1', 160, 160);
}

window.onload = function () {
    showPopup("You start with four plants. Dig them out and move them towards each other to create new plants!");
    createGrid();
    setupFlowerPackages();
    testProximity();
};
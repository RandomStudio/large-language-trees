let draggedCircle = -1; // index of the dragging flower
let dragOffsetY = 0;
let dragOffsetX = 0;
let plants = [];

let scrollOffset = 0;
let scrollSpeed = 0;
let deltaY = 0;

// Infos about the initial positions
let startX = 350;
let startY = 50;

//Infos about the 2 areas we can drop
let x_area1 = 100;
let y_area1 = 150;
let x_area2 = 100;
let y_area2 = 260;
let side = 100;

// Table for RGB colors
const colorsRGB = {
  Red: [255, 0, 0],
  White: [255, 255, 220],
  Green: [0, 128, 0],
  Purple: [128, 0, 128],
  "Light Blue": [173, 216, 230],
  Violet: [238, 130, 238],
  Blue: [0, 0, 139],
  "Light Pink": [255, 182, 193],
  "Light Green": [144, 238, 144],
  "Green-Brown": [107, 142, 35],
  "Dark Red": [139, 0, 0],
  Yellow: [255, 255, 0],
  Orange: [255, 165, 0],
  Pink: [255, 192, 203],
};

function preload() {
  loadJSON("database.json", function (data) {
    for (let plant of data) {
      plants.push({
        commonName: plant.commonName,
        color: colorsRGB[plant.properties.flowerColour] || [0, 0, 0], // Par défaut en noir si non trouvé
        yPos: startY + plants.length * 100,
        xPos: startX,
        stemLength: plant.properties.stemLengthCm,
        petalCountRange: plant.properties.petalCountRange,
        inthebox: false,
        inthebox2: false,
      });
    }
  });
}

function setup() {
  createCanvas(400, 600);
}

function draw() {
  background(255);
  updateScroll();
  //Drawing the 2 boxes
  drawTargetArea(x_area1, y_area1, side);
  drawTargetArea(x_area2, y_area2, side);

  for (let i = 0; i < plants.length; i++) {
    // Met la plante dans sa position initiale dans le menu scroll (lui aussi dans sa position de base)
    let plant = plants[i];
    let y = plant.yPos;
    let x = plant.xPos;

    // Si le cercle est drag and drop : on prend la position de la souris x et de la souris y
    if (i === draggedCircle) {
      y = mouseY;
      x = mouseX;
    }

    if (!plant.inthebox && !plant.inthebox2 && i !== draggedCircle) {
      y += deltaY; // Appliquer le deltaY seulement si le cercle n'est pas dans la box
    }

    fill(plant.color);
    drawFlower(x, y, plant);
  }
}

function mouseWheel(event) {
  scrollSpeed += event.delta;
}

function updateScroll() {
  let newDeltaY = deltaY + scrollSpeed * 0.05;

  let topCircleY = startY + newDeltaY;
  let bottomCircleY = startY + (plants.length - 1) * 100 + newDeltaY;

  if (topCircleY > 50) {
    deltaY = 0;
    scrollSpeed = 0;
  } else if (bottomCircleY < height - 250) {
    // Ajustement en fonction de la hauteur du canvas
    deltaY = 550 - (startY + (plants.length - 1) * 100);
    scrollSpeed = 0;
  } else {
    deltaY = newDeltaY;
  }

  scrollSpeed *= 0.95;
}

function drawTargetArea(x_area, y_area, side) {
  fill(255, 0, 0, 100);
  rect(x_area, y_area, side, side);
}

function mousePressed() {
  for (let i = 0; i < plants.length; i++) {
    let plant = plants[i];
    let y = plant.yPos;
    if (!plant.inthebox && !plant.inthebox2) {
      y = y + deltaY;
    }
    let x = plant.xPos;
    if (dist(mouseX, mouseY, x, y) < 20) {
      // Condition ajustée pour détecter si la souris est sur le cercle
      draggedCircle = i;
      return;
    }
  }
}

function mouseReleased() {
  if (draggedCircle !== -1) {
    let plant = plants[draggedCircle];
    if (
      mouseX > x_area1 &&
      mouseX < x_area1 + side &&
      mouseY > y_area1 &&
      mouseY < y_area1 + side &&
      plants.every((plant) => !plant.inthebox)
    ) {
      // Placer le cercle au centre de la boîte
      plant.inthebox = true;
      plant.xPos = x_area1 + side / 2; // Centrer le cercle dans la boîte en x
      plant.yPos = y_area1 + side / 2; // Centrer le cercle dans la boîte en y
      plant.inthebox2 = false;
    } else if (
      mouseX > x_area2 &&
      mouseX < x_area2 + side &&
      mouseY > y_area2 &&
      mouseY < y_area2 + side &&
      plants.every((plant) => !plant.inthebox2)
    ) {
      // Placer le cercle au centre de la boîte
      plant.inthebox2 = true;
      plant.xPos = x_area2 + side / 2; // Centrer le cercle dans la boîte en x
      plant.yPos = y_area2 + side / 2; // Centrer le cercle dans la boîte en y
      plant.inthebox = false;
    } else {
      plant.inthebox = false;
      plant.inthebox2 = false;
      plant.xPos = startX;
      plant.yPos = startY + draggedCircle * 100;
    }
    draggedCircle = -1; // Réinitialiser le cercle en cours de drag
    console.log(draggedCircle);
  }
}

function drawFlower(x, y, plant) {
  const stemHeight = plant.stemLength * 4; // Adjust stem height as necessary
  const petalCount = parseInt(plant.petalCountRange.split("-")[0]);
  // Stem
  stroke(0, 128, 0);
  strokeWeight(4);
  line(x, y, x, y + stemHeight);
  // Core
  fill([255, 165, 0]);
  noStroke();
  circle(x, y, 20);
  // Petals
  drawPetals(x, y - 10, petalCount, plant.color); // Adjust y for petal position
}

function drawPetals(x, y, petalCount, color) {
  const petalRadius = 15;
  for (let i = 0; i < petalCount; i++) {
    const angle = (TWO_PI / petalCount) * i;
    stroke(0, 0, 0);
    strokeWeight(2);
    fill(color);
    ellipse(
      x + cos(angle) * 20, // Adjust for petal distance from center
      y + sin(angle) * 20 + petalRadius,
      petalRadius * 2,
      petalRadius * 2
    );
  }
}

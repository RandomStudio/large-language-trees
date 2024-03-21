<script lang="ts">
    import type { Plant } from "./types";
    import P5 from "p5-svelte";
    export let plant: Plant;
    let radius = 40; // Radius of the base circle

    const colorsRGB = {
        blue: [0, 0, 255],
        pink: [255, 192, 203],
        white: [255, 255, 255],
        green: [0, 128, 0],
        purple: [128, 0, 128],
        "light blue": [173, 216, 230],
        violet: [238, 130, 238],
        "dark blue": [0, 0, 139],
        "light pink": [255, 182, 193],
        "light green": [144, 238, 144],
        "green-brown": [107, 142, 35], // Olive Green approximation
        "dark red": [139, 0, 0],
        yellow: [255, 255, 0],
        orange: [255, 165, 0],
        red: [255, 0, 0],
    };

    console.log(plant);

    const sketch = (p5) => {
        p5.setup = () => {
            p5.createCanvas(400, 400);
            p5.DisplayPlant();

            //p5.createPlantNameElements();
            //document.getElementById('resetButton').addEventListener('click', resetAndAssignPlants);
        };

        p5.DisplayPlant = () => {
            p5.clear();
            let color = plant.properties.flowerColour;
            console.log(color);
            let lengthofstem = plant.properties.lengthofstem;
            let numberpetals = plant.properties.numberpetals;
            let x_plant1 = 300;
            let y_plant1 = 200;
            createStem(lengthofstem, x_plant1, y_plant1);
            p5.noStroke();
            p5.fill(255, 165, 0);
            p5.circle(x_plant1, y_plant1, 50);
            // Create petals for each plant info
            p5.stroke(0, 0, 0); // RGB pour vert
            p5.strokeWeight(2);
            createPetals(numberpetals, color, x_plant1, y_plant1);
        };

        function createPetals(number, color, x_center, y_center) {
            let flowerColor = color.trim();
            let rgb = colorsRGB[color];
            p5.fill(rgb[0], rgb[1], rgb[2]);
            // Create an array to hold the coordinates of the circles (petals)
            let petalsCoordinates = generatePetalsCoordinates(
                number,
                x_center,
                y_center,
            );
            // Draw circles (petals)
            for (let i = 0; i < petalsCoordinates.length; i++) {
                let [x, y] = petalsCoordinates[i];
                p5.fill(flowerColor); // Set the fill color based on the ColorFlower
                p5.circle(x, y, 60); // Draw a circle (petal) at the coordinates
            }
        }

        function generatePetalsCoordinates(amount, x_center, y_center) {
            let coordinates = [];
            let angleStep = 360 / amount; // Calculate the angle step for each petal
            let adjustedRadius = radius; // Set the initial radius
            // Adjust the radius if the number of petals exceeds 12
            if (amount > 12) {
                adjustedRadius += 10; // Increase the radius by 10
            }
            for (let i = 0; i < amount; i++) {
                // Calculate the angle for the current petal
                let angle = i * angleStep;
                // Convert angle to radians
                let radians = angle * (Math.PI / 180);
                // Calculate coordinates based on the angle and adjusted radius
                let x = x_center + adjustedRadius * Math.cos(radians);
                let y = y_center + adjustedRadius * Math.sin(radians);
                coordinates.push([x, y]);
            }
            return coordinates;
        }

        function createStem(length, x_center, y_center) {
            // Définir l'épaisseur et la couleur du trait
            p5.strokeWeight(10);
            p5.stroke(100, 220, 0);
            // Dessiner le trait
            p5.line(x_center, y_center, x_center, y_center + length * 200);
        }
    };
</script>

<characteristics.fruit></characteristics.fruit>

<P5 {sketch} />

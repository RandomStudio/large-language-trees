<script lang="ts">
  import type {
    GardenPlantEntryWithPlant,
    GardenViewData,
    PlantProperties,
  } from "$lib/types";
  import { onMount } from "svelte";

  export let data: GardenViewData;

  let alt = "alt placeholder";
  let currentWindSpeed: number | null = null;
  let currentCloudCover: number | null = null;

  const apiUrl =
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m,cloudcover&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,cloudcover";

  async function fetchWeatherData() {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      currentWindSpeed = data.current.wind_speed_10m;
      console.log(`Current wind speed: ${currentWindSpeed} m/s`); // Log the wind speed
      updateSkewAnimation();
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

  function updateSkewAnimation() {
    const baseSkewDegree = 4;
    const additionalSkew = currentWindSpeed
      ? Math.min(currentWindSpeed / 10, 1)
      : 0;
    const skewDegree = baseSkewDegree + additionalSkew;
    console.log(`Skew degree based on wind speed: ${skewDegree}deg`); // Log the calculated skew degree

    const styleSheet = document.styleSheets[0];
    const keyframes = `
    @keyframes skew-animation {
      0% {
        transform: skew(${skewDegree}deg);
        left: -7px;
      }
      50% {
        transform: skew(-${skewDegree}deg);
        left: 7px;
      }
      100% {
        transform: skew(${skewDegree}deg);
        left: -7px;
      }
    }
  `;

    // Remove existing skew-animation keyframes if they exist
    for (let i = styleSheet.cssRules.length - 1; i >= 0; i--) {
      const rule = styleSheet.cssRules[i];
      if (rule instanceof CSSKeyframesRule && rule.name === "skew-animation") {
        styleSheet.deleteRule(i);
      }
    }

    // Insert the new keyframes
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  }

  // Distribution on screen and size of plants in database
  const rootScale = 2; // Maths root not plant roots lol
  const minPlantHeight = Math.pow(0.1, 1 / rootScale);
  const maxPlantHeight = Math.pow(30, 1 / rootScale);
  const randomnessY = 20; // Random displacement in y direction

  // Plant min and max size on screen
  const minPlantHeightOutput = 75;
  const maxPlantHeightOutput = 200;
  const animationLength = 5;
  const animationDegree = 5;

  // Display size and borders
  const monitorWidth = 1920;
  const monitorHeight = 1080;
  const frameSize = 100;
  const topBorder = 100;

  // Constants relating to remap function
  const low1 = minPlantHeight;
  const low2 = 0;
  const high1 = maxPlantHeight;
  const high2 = 1;

  // Constants relating to making plants not overlap
  const plantIDs: string[] = [];
  const plantPositionsX: number[] = [];
  const plantPositionsY: number[] = [];
  let crowdednessTolerance = 0; // Don't change this, use initial instead
  const initialCrowdednessTolerance = 150;

  // Constants relating to adding new plants
  const newPlantIDs: string[] = [];
  const newPlantParent1: string[] = [];

  onMount(() => {
    fetchWeatherData();
    initializeAnimation();
  });

  function mapRange(
    value: number,
    low1: number,
    high1: number,
    low2: number,
    high2: number,
  ): number {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  function plantHeight(plant: GardenPlantEntryWithPlant): number {
    return (plant.plant.properties as PlantProperties)["high(m)"] as number;
  }

  function rootScaleFromPlantHeight(plant: GardenPlantEntryWithPlant): number {
    return Math.min(
      Math.pow(
        (plant.plant.properties as PlantProperties)["high(m)"] as number,
        1 / rootScale,
      ),
      30,
    );
  }

  function remapPlantHeight(
    value: number,
    lowIn: number,
    highIn: number,
  ): number {
    return mapRange(value, lowIn, highIn, low2, high2);
  }

  function placePlantOnYAxis(plant: GardenPlantEntryWithPlant): number {
    return (
      frameSize +
      topBorder +
      (monitorHeight - minPlantHeightOutput - frameSize * 2 - topBorder) *
        (1 -
          remapPlantHeight(
            Math.log(rootScaleFromPlantHeight(plant)) + 1,
            Math.log(minPlantHeight) + 1,
            Math.log(maxPlantHeight) + 1,
          )) // One minus remapped value in order to make the plants go from small to big
    );
  }

  function placePlantOnXAxis(plant: GardenPlantEntryWithPlant): number {
    let proposedPlantPositionX = 0;
    let isSpaceOk = false;

    crowdednessTolerance = initialCrowdednessTolerance;

    while (!isSpaceOk) {
      proposedPlantPositionX = findSpace();
      isSpaceOk = checkIfSpaceIsOk(plant, proposedPlantPositionX);
      crowdednessTolerance -= 1;
    }

    plantIDs.push(plant.plant.id);
    plantPositionsX.push(proposedPlantPositionX);
    plantPositionsY.push(placePlantOnYAxis(plant));
    return proposedPlantPositionX;
  }

  function findSpace(): number {
    return (
      Math.random() * (monitorWidth - (frameSize + maxPlantHeightOutput)) +
      frameSize
    );
  }

  function checkIfSpaceIsOk(
    plant: GardenPlantEntryWithPlant,
    proposedPlantPositionX: number,
  ): boolean {
    let distanceList = [];
    for (let i = 0; i < plantIDs.length; i++) {
      let distance = calculateDistance(
        plant,
        proposedPlantPositionX,
        plantPositionsX[i],
        plantPositionsY[i],
      );
      distanceList.push(distance);
    }
    return Math.min(...distanceList) >= crowdednessTolerance;
  }

  function calculateDistance(
    plant: GardenPlantEntryWithPlant,
    proposedPlantPositionX: number,
    x: number,
    y: number,
  ): number {
    let plantX = proposedPlantPositionX;
    let plantY = placePlantOnYAxis(plant);

    let deltaX = plantX - x;
    let deltaY = plantY - y;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  function randomAnimationDelay(): string {
    return `${(Math.random() * -animationLength) / 3}s`;
  }

  function initializeAnimation() {
    // Create SVG element
    const svgNamespace = "http://www.w3.org/2000/svg";
    const sprayArea = document.createElementNS(svgNamespace, "svg");
    sprayArea.style.position = "absolute";
    sprayArea.style.top = "0";
    sprayArea.style.left = "0";
    sprayArea.style.width = "100%";
    sprayArea.style.height = "100%";
    document.body.appendChild(sprayArea);

    function createDot(x: number, y: number): SVGCircleElement {
      const dot = document.createElementNS(svgNamespace, "circle");
      dot.setAttribute("cx", x.toString());
      dot.setAttribute("cy", y.toString());
      dot.setAttribute("r", (Math.random() * 2 + 1.2).toString()); // Increase dot size
      const color = `rgb(${255}, ${165 + Math.random() * 90}, 0)`;
      dot.setAttribute("fill", color);
      dot.setAttribute("class", "spray-dot moving-dot");
      dot.style.animation = `fade-in-out ${animationLength}s ${Math.random() * 2}s linear`; // Set random delay for each dot
      dot.dataset.angle = (Math.random() * Math.PI * 2).toString(); // Store initial angle
      return dot;
    }

    function moveDot(dot: SVGCircleElement) {
      const speed = Math.random() * 0.5 + 0.1; // Random speed between 0.1 and 0.6
      const angle = parseFloat(dot.dataset.angle!);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      let x = parseFloat(dot.getAttribute("cx")!) + dx;
      let y = parseFloat(dot.getAttribute("cy")!) + dy;
      // Contain within boundaries
      x = Math.max(0, Math.min(window.innerWidth, x));
      y = Math.max(0, Math.min(window.innerHeight, y));
      dot.setAttribute("cx", x.toString());
      dot.setAttribute("cy", y.toString());
      // Update angle for next movement
      dot.dataset.angle = (
        angle +
        ((Math.random() - 0.5) * Math.PI) / 4
      ).toString(); // Random change in angle
    }

    function animate(dots: SVGCircleElement[]) {
      function step() {
        dots.forEach((dot) => moveDot(dot));
        requestAnimationFrame(step);
      }
      step();
    }

    data.garden.plantsInGarden.forEach((plant) => {
      const plantElement = document.getElementById(plant.plant.id);
      if (plantElement) {
        const rect = plantElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2; // Position dots around the center

        const dots: SVGCircleElement[] = [];
        for (let i = 0; i < 50; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 20;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const dot = createDot(x, y);
          sprayArea.appendChild(dot);
          dots.push(dot);
        }

        animate(dots);
      }
    });
  }
</script>

<body>
  <div id="container" class="fixed top-0 left-0 w-screen h-screen">
    {#each data.garden.plantsInGarden as plant}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <img
        id={plant.plant.id}
        src={plant.plant.imageUrl}
        {alt}
        class="fixed skew-animated"
        on:load={() => {
          console.log();
        }}
        style:width={minPlantHeightOutput +
          remapPlantHeight(
            rootScaleFromPlantHeight(plant),
            minPlantHeight,
            maxPlantHeight,
          ) *
            (maxPlantHeightOutput - minPlantHeightOutput) +
          "px"}
        style:margin-top={(
          placePlantOnYAxis(plant) +
          (Math.random() - 0.5) * randomnessY
        ).toString() + "px"}
        style:margin-left={placePlantOnXAxis(plant).toString() + "px"}
        style:animation-duration={animationLength.toString() + "s"}
        style:animation-delay={randomAnimationDelay()}
        style:z-index={(3000 - plantHeight(plant) * 100).toString()}
      />
    {/each}
  </div>
</body>

<style>
  @keyframes skew-animation {
    0% {
      transform: skew(4deg);
      left: -7px;
    }
    50% {
      transform: skew(-4deg);
      left: 7px;
    }
    100% {
      transform: skew(4deg);
      left: -7px;
    }
  }

  .skew-animated {
    animation: skew-animation infinite;
  }

  @keyframes fade-in-out {
    0% {
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  body {
    margin: 0;
    overflow: hidden;
    background: white;
  }

  svg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .spray-dot {
    opacity: 0; /* Start with dots invisible */
    transition: opacity 0.1s linear;
  }

  .moving-dot {
    animation:
      float-move linear infinite,
      fade-in-out 5s; /* Combine animations */
  }
</style>

<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    // Define variables to control the fill speed and selected colour
    let fillSpeed = "slow";
    let selectedColour = "#FF0000";

    // Function to handle user input change for fill speed
    function handleSpeedChange(event: Event) {
        fillSpeed = (event.target as HTMLSelectElement).value;
    }

    // Function to handle user input change for selected colour
    function handleColourChange(event: Event) {
        selectedColour = (event.target as HTMLSelectElement).value;
    }

    onMount(() => {
        // Load the image into the canvas and set up the functionality
        // You can replace this part with your image loading logic
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const context = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            // Set the canvas size to match the image size
            canvas.width = img.width;
            canvas.height = img.height;

            context.drawImage(img, 0, 0);

            // Call the function to set up the canvas functionality
            setupCanvas(canvas, context);
        };

        img.src = "/plants/Pansy.webp"; // Replace with your image path
    });

    // Function to set up canvas functionality
    function setupCanvas(
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
    ) {
        // Add event listener for canvas click
        canvas.addEventListener("click", (evt) => {
            const { x, y } = getEventCoords(
                evt,
                canvas.getBoundingClientRect(),
            );
            console.log("User clicked the point x", x, "y", y);
            fillColour(x, y, selectedColour, context);
        });
    }

    // Function to fill colour in canvas
    function fillColour(
        x: number,
        y: number,
        colour: string,
        context: CanvasRenderingContext2D,
    ) {
        // Function logic for filling colour goes here
        // You can integrate the provided fillColour function here
        // Since this function is specific to your canvas and image setup, you'll need to adjust it accordingly
    }

    // Helper function to get event coordinates
    function getEventCoords(evt: MouseEvent, nodeRect: DOMRect) {
        let x, y;
        if (evt.touches && evt.touches.length > 0) {
            x = evt.touches[0].clientX;
            y = evt.touches[0].clientY;
        } else {
            x = evt.clientX;
            y = evt.clientY;
        }
        return { x: Math.round(x - nodeRect.x), y: Math.round(y - nodeRect.y) };
    }
</script>

<div
    class="flex items-center justify-center min-h-screen bg-green-300 overflow-hidden"
>
    <main class="text-left mx-1.5">
        <h1 class="text-3xl font-bold text-blue-600">The Garden</h1>

        <div>
            <div class="flex justify-center space-x-4">
                <canvas id="canvas"></canvas>
            </div>
            <form class="text-center">
                <label for="speedForm">Fill Speed:</label>
                <select
                    id="speedForm"
                    class="bg-transparent text-blue-600 border border-blue-500 rounded"
                >
                    <option value="slow">Slow</option>
                    <option value="fast">Fast</option>
                </select>
                <br />
                <label for="colourForm">Selected Colour:</label>
                <input type="color" id="colourForm" value="#FF0000" />
            </form>
            <br />
        </div>
        <div class="text-center">
            <p class="text-blue-600">
                Welcome to the common garden of Lucullus. This Digital Common
                Garden is about connection and cross-pollination.
                <br />
                <br />Find other Gardeners to start cross-breeding and witness
                the offspring flourish in the common garden of Lucullus.
            </p>
        </div>
        <br />
        <span class="text-blue-600 font-semibold">Production:</span>
        <br />
        <span class="text-blue-600">Studio Random</span>
        <br />
        <span class="text-blue-600 font-semibold">Image Data:</span>
        <br />
        <span class="text-blue-600">Chat GPT/ Open AI</span>
        <br />
        <br />
    </main>
</div>

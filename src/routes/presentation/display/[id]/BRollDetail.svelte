<script lang="ts">
  import { afterUpdate } from "svelte";

  export let imageUrl: string;
  export let plantName: string;
  export let userName: string;

  let container: HTMLDivElement;
  let plantImage: HTMLImageElement;
  let description: HTMLDivElement;
  let originX: number, originY: number;
  let scaleStart: number,
    scaleEnd: number,
    translateXStart: number,
    translateYStart: number,
    translateXEnd: number,
    translateYEnd: number;

  let descriptionLeft: number, descriptionTop: number;

  function getRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  function isNonTransparentPixel(
    x: number,
    y: number,
    context: CanvasRenderingContext2D
  ): boolean {
    const imageData = context.getImageData(x, y, 1, 1).data;
    return imageData[3] !== 0; // Alpha value 0 indicates transparent
  }

  function setInitialPosition(): void {
    const imgWidth: number = plantImage.naturalWidth;
    const imgHeight: number = plantImage.naturalHeight;

    if (!imgWidth || !imgHeight) {
      console.error("Image dimensions not available.");
      return;
    }

    const maxScale: number = Math.max(scaleStart, scaleEnd);
    const maxTranslateX: number = Math.max(
      Math.abs(translateXStart),
      Math.abs(translateXEnd)
    );
    const maxTranslateY: number = Math.max(
      Math.abs(translateYStart),
      Math.abs(translateYEnd)
    );

    const visibleWidth: number = imgWidth * maxScale;
    const visibleHeight: number = imgHeight * maxScale;

    // Create a canvas to analyze image transparency
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to obtain 2D context from canvas.");
    }

    // Draw the image onto the canvas
    context.drawImage(plantImage, 0, 0, imgWidth, imgHeight);

    let placed: boolean = false;
    let attemptCount = 0;

    while (!placed && attemptCount < 10) {
      // Limit the number of attempts to avoid infinite loops
      const randomMarginWidth: number = getRandom(
        visibleWidth * 0.2,
        visibleWidth * 0.3
      );
      const randomMarginHeight: number = getRandom(
        visibleHeight * 0.2,
        visibleHeight * 0.3
      );

      if (
        isNonTransparentPixel(randomMarginWidth, randomMarginHeight, context)
      ) {
        descriptionLeft = randomMarginWidth / imgWidth;
        descriptionTop = randomMarginHeight / imgHeight;

        const descWidth: number = description.offsetWidth;
        const descHeight: number = description.offsetHeight;

        const newLeft: number = randomMarginWidth * maxScale + maxTranslateX;
        const newTop: number = randomMarginHeight * maxScale + maxTranslateY;

        const viewportWidth: number = window.innerWidth;
        const viewportHeight: number = window.innerHeight;

        if (
          newLeft + descWidth <= viewportWidth &&
          newTop + descHeight <= viewportHeight
        ) {
          description.style.left = `${randomMarginWidth}px`;
          description.style.top = `${randomMarginHeight}px`;
          placed = true;
        }
      }
      attemptCount++;
    }

    if (!placed) {
      console.error("Failed to place description within viewable area.");
    }
  }

  function updateDescriptionPosition(): void {
    const rect: DOMRect = plantImage.getBoundingClientRect();

    const imgWidth: number = rect.width;
    const imgHeight: number = rect.height;

    const newLeft: number = rect.left + imgWidth * descriptionLeft;
    const newTop: number = rect.top + imgHeight * descriptionTop;

    description.style.left = `${newLeft}px`;
    description.style.top = `${newTop}px`;
  }

  function animate(): void {
    updateDescriptionPosition();
    requestAnimationFrame(animate);
  }

  // Initialize variables and set initial position
  $: {
    if (imageUrl && container && plantImage && description) {
      scaleStart = getRandom(0.5, 1.0);
      scaleEnd = getRandom(1.0, 1.5);

      translateXStart = getRandom(-100, 100);
      translateYStart = getRandom(-100, 100);
      translateXEnd = getRandom(-100, 100);
      translateYEnd = getRandom(-100, 100);

      originX = getRandom(0, 100);
      originY = getRandom(0, 100);

      setInitialPosition();
      requestAnimationFrame(animate);
    }
  }

  // Use afterUpdate to ensure content is fully rendered before positioning
  afterUpdate(() => {
    if (description && plantImage) {
      updateDescriptionPosition();
    }
  });
</script>

<div class="w-screen h-screen bg-roel_rose relative overflow-hidden">
  <div
    class="absolute right-36 top-5 text-roel_purple text-3xl font-primer z-10"
  >
    Join the Garden!
  </div>
  <div class="absolute right-5 top-5 w-28 h-auto z-10">
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <img
      src="/livinggarden_QR_purple.png"
      alt="Barcode"
      class="place-content-center h-auto"
    />
  </div>

  <div
    bind:this={container}
    class="absolute right-5 top-5 w-[2000px] h-auto z-0"
    style="position: relative;"
  >
    <!-- Container for the image and text -->
    <img
      bind:this={plantImage}
      src={imageUrl}
      alt="Plant"
      class="place-content-center h-auto camera-animation"
      style="--scaleStart: {scaleStart}; --scaleEnd: {scaleEnd}; --translateXStart: {translateXStart}px; --translateYStart: {translateYStart}px; --translateXEnd: {translateXEnd}px; --translateYEnd: {translateYEnd}px; transform-origin: {originX}% {originY}%;"
    />
    <div
      bind:this={description}
      class="description bg-roel_purple text-roel_rose absolute p-2"
    >
      {userName}'s {plantName}
    </div>
  </div>
</div>

<style>
  .camera-animation {
    animation: cameraMove 10s ease-in-out infinite;
    position: relative;
  }
  @keyframes cameraMove {
    0% {
      transform: scale(var(--scaleStart))
        translate(var(--translateXStart), var(--translateYStart));
    }
    100% {
      transform: scale(var(--scaleEnd))
        translate(var(--translateXEnd), var(--translateYEnd));
    }
  }
</style>

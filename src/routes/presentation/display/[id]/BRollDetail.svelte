<script>
  // @ts-nocheck

  import { onMount } from "svelte";

  let container;
  let textOverlay;
  let originX, originY;
  let scaleStart,
    scaleEnd,
    translateXStart,
    translateYStart,
    translateXEnd,
    translateYEnd;

  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  function isNonTransparentPixel(x, y, context) {
    const imageData = context.getImageData(x, y, 1, 1).data;
    return imageData[3] !== 0; // Alpha value 0 indicates transparent
  }

  function placeDescriptiononImage() {
    const img = container.querySelector("img");
    const description = container.querySelector(".description");

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Create a canvas to analyze image transparency
    const canvas = document.createElement("canvas");
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const context = canvas.getContext("2d");

    // Draw the image onto the canvas
    context.drawImage(img, 0, 0, imgWidth, imgHeight);

    let placed = false;
    while (!placed) {
      const randomMarginWidth = getRandom(imgWidth * 0.2, imgWidth * 0.3);
      const randomMarginHeight = getRandom(imgHeight * 0.2, imgHeight * 0.3);

      const positionHorizontal =
        Math.random() < 0.5 ? randomMarginWidth : imgWidth - randomMarginWidth;
      const positionVertical =
        Math.random() < 0.5
          ? randomMarginHeight
          : imgHeight - randomMarginHeight;

      if (
        isNonTransparentPixel(positionHorizontal, positionVertical, context)
      ) {
        description.style.left = `${positionHorizontal}px`;
        description.style.top = `${positionVertical}px`;
        placed = true;
      }
    }
  }

  function setInitialPosition() {
    const img = container.querySelector("img");
    const description = container.querySelector(".description");

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const visibleWidth = imgWidth * scaleStart;
    const visibleHeight = imgHeight * scaleStart;

    // Create a canvas to analyze image transparency
    const canvas = document.createElement("canvas");
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const context = canvas.getContext("2d");

    // Draw the image onto the canvas
    context.drawImage(img, 0, 0, imgWidth, imgHeight);

    let placed = false;
    while (!placed) {
      const randomMarginWidth = getRandom(
        visibleWidth * 0.2,
        visibleWidth * 0.3
      );
      const randomMarginHeight = getRandom(
        visibleHeight * 0.2,
        visibleHeight * 0.3
      );

      if (
        isNonTransparentPixel(randomMarginWidth, randomMarginHeight, context)
      ) {
        description.style.left = `${randomMarginWidth}px`;
        description.style.top = `${randomMarginHeight}px`;
        placed = true;
      }
    }
  }

  onMount(() => {
    scaleStart = getRandom(0.5, 1.0);
    scaleEnd = getRandom(1.0, 1.5);

    translateXStart = getRandom(-100, 100);
    translateYStart = getRandom(-100, 100);
    translateXEnd = getRandom(-100, 100);
    translateYEnd = getRandom(-100, 100);

    originX = getRandom(0, 100);
    originY = getRandom(0, 100);

    setInitialPosition();
  });
</script>

<div class="bg-roel_rose">
  <div class="text-roel_purple text-3xl absolute right-36 top-5 font-primer">
    Join the Garden!
  </div>
  <div class="absolute right-5 w-28 h-auto top-5">
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <img
      src="/livinggarden_QR_purple.png"
      alt="Barcode"
      class="place-content-center h-auto"
    />
  </div>
  <div
    bind:this={container}
    class="absolute right-5 w-[2000px] h-auto top-5 camera-animation"
    style="--scaleStart: {scaleStart}; --scaleEnd: {scaleEnd}; --translateXStart: {translateXStart}px; --translateYStart: {translateYStart}px; --translateXEnd: {translateXEnd}px; --translateYEnd: {translateYEnd}px; transform-origin: {originX}% {originY}%;"
  >
    <!-- Container for the image and text -->
    <img src="/46.png" alt="Plant" class="place-content-center h-auto" />
    <div class="description bg-roel_purple text-roel_rose absolute">
      JessieK's
      <br />Fern
    </div>
  </div>
</div>

<style>
  .camera-animation {
    animation: cameraMove 10s ease-in-out;
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
  .description {
    position: absolute;
    padding: 5px;
  }
  .bg-roel_purple {
    background-color: purple; /* Replace with actual color */
  }
  .text-roel_rose {
    color: #e91e63; /* Replace with actual color */
  }
</style>

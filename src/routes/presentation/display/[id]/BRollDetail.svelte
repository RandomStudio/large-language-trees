<script>
  // @ts-nocheck
  import { onMount } from "svelte";

  export let imageUrl;
  export let plantName;
  export let userName;

  let container;
  let description;
  let originX, originY;
  let scaleStart,
    scaleEnd,
    translateXStart,
    translateYStart,
    translateXEnd,
    translateYEnd;

  let descriptionLeft, descriptionTop;

  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  function isNonTransparentPixel(x, y, context) {
    const imageData = context.getImageData(x, y, 1, 1).data;
    return imageData[3] !== 0; // Alpha value 0 indicates transparent
  }

  function setInitialPosition() {
    const img = container.querySelector("img");
    description = container.querySelector(".description");

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const maxScale = Math.max(scaleStart, scaleEnd);
    const maxTranslateX = Math.max(
      Math.abs(translateXStart),
      Math.abs(translateXEnd)
    );
    const maxTranslateY = Math.max(
      Math.abs(translateYStart),
      Math.abs(translateYEnd)
    );

    const visibleWidth = imgWidth * maxScale;
    const visibleHeight = imgHeight * maxScale;

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
        descriptionLeft = randomMarginWidth / imgWidth;
        descriptionTop = randomMarginHeight / imgHeight;

        const descWidth = description.offsetWidth;
        const descHeight = description.offsetHeight;

        const newLeft = randomMarginWidth * maxScale + maxTranslateX;
        const newTop = randomMarginHeight * maxScale + maxTranslateY;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (
          newLeft + descWidth <= viewportWidth &&
          newTop + descHeight <= viewportHeight
        ) {
          description.style.left = `${randomMarginWidth}px`;
          description.style.top = `${randomMarginHeight}px`;
          placed = true;
        }
      }
    }
  }

  function updateDescriptionPosition() {
    const img = container.querySelector("img");
    const rect = img.getBoundingClientRect();

    const imgWidth = rect.width;
    const imgHeight = rect.height;

    const newLeft = rect.left + imgWidth * descriptionLeft;
    const newTop = rect.top + imgHeight * descriptionTop;

    description.style.left = `${newLeft}px`;
    description.style.top = `${newTop}px`;
  }

  function animate() {
    updateDescriptionPosition();
    requestAnimationFrame(animate);
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
    requestAnimationFrame(animate);
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
      src={imageUrl}
      alt="Plant"
      class="place-content-center h-auto camera-animation"
      style="--scaleStart: {scaleStart}; --scaleEnd: {scaleEnd}; --translateXStart: {translateXStart}px; --translateYStart: {translateYStart}px; --translateXEnd: {translateXEnd}px; --translateYEnd: {translateYEnd}px; transform-origin: {originX}% {originY}%;"
    />
    <div class="description bg-roel_purple text-roel_rose absolute p-2">
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

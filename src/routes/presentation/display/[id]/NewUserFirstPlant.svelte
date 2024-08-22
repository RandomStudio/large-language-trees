<script lang="ts">
  import { onMount } from "svelte";
  import { getColors } from "./findColors";
  import AnimatedPlant from "../../../../components/AnimatedPlant.svelte";

  export let imageUrl: string;
  export let plantName: string;
  export let gardenerName: string;

  export let applyFilters: boolean = false;
  export let positionStyles: string = "w-full";

  const soundFiles = [
    "/Sound 1 - Schuup.mp3",
    "/Sound 2 - Dududu.mp3",
    "/Sound 3 - Whistles.mp3",
    "/Sound 4 - Schuup2.mp3",
    "/Sound 5 - Dududu2.mp3",
    "/Sound 6 - Ghost.mp3"
  ];

  function getRandomSoundFile() {
    const randomIndex = Math.floor(Math.random() * soundFiles.length);
    return soundFiles[randomIndex];
  }

  let brightColor = "rgb(255, 185, 198)";
  let darkColor = "rgb(117, 0, 147)";

  let img: HTMLImageElement;

  onMount(() => {
    img.onload = () => {
      const result = getColors(img);
      brightColor = result.brightColor;
      darkColor = result.darkColor;
      const audio = new Audio(getRandomSoundFile());
      audio.play();
    };
  });
</script>

<div
  class="w-screen h-screen"
  style="background: linear-gradient({darkColor}, {brightColor});"
>
  <div
    class="absolute w-screen h-screen flex text-center items-start justify-center text-9xl py-[2vh] font-gyst"
    style="color: {brightColor};"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plantName.toUpperCase()}
  </div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img
      class="opacity-0"
      src={imageUrl}
      alt="Hero view the new user's first plant"
      bind:this={img}
      crossorigin="anonymous"
    />
    <div class="absolute w-screen h-screen flex items-center justify-center">
      <AnimatedPlant
        imageURL={imageUrl || ""}
        {applyFilters}
        {positionStyles}
      />
    </div>
  </div>

  <div
    class="absolute w-screen h-screen flex text-center items-end justify-center text-9xl py-[2vh] font-gyst"
    style="color: {darkColor};"
  >
    Just sprouted <br /> in the garden!
  </div>
</div>

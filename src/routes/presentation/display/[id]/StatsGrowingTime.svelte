<script lang="ts">
  import { onMount } from "svelte";
  import { getColors } from "./findColors";
  import moment from "moment";

  export let imageUrl: string;
  export let plantName: string;
  export let gardenerName: string;
  export let date: Date;

  let brightColor = "rgb(255, 185, 198)";
  let darkColor = "rgb(117, 0, 147)";

  let img: HTMLImageElement;

  onMount(() => {
    img.onload = () => {
      const result = getColors(img);
      brightColor = result.brightColor;
      darkColor = result.darkColor;
    };
  });
  const now = moment();
  const duration = moment.duration(now.diff(date));

  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const formattedTime = `${hours}H ${minutes}M ${seconds}S`;
</script>

<div class="min-h-screen" style="background-color:{brightColor}">
  <div
    class="w-full h-[250px] flex text-center items-center justify-center text-6xl font-jeanb"
    style="background-color: {darkColor}; color: {brightColor};"
  >
    {gardenerName.toUpperCase()}'S <br />
    {plantName.toUpperCase()}
  </div>

  <div class=" absolute top-1/2 w-full h-auto" style="fill:{darkColor}">
    <svg viewBox="0 0 1000 801" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 0H1000V301C1000 577.142 776.142 801 500 801C223.858 801 0 577.142 0 301V0Z"
      />
    </svg>
  </div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img
      src={imageUrl}
      alt="Lavender"
      bind:this={img}
      crossorigin="anonymous"
    />
  </div>

  <div
    class="w-full h-[250px] flex flex-col text-center items-center justify-center absolute bottom-0"
    style="background-color:{brightColor}; color:{darkColor}"
  >
    <div class="text-4xl font-primer">has been growing for:<br /></div>
    <div class="text-6xl font-jeanb">
      {formattedTime}
    </div>
  </div>
</div>

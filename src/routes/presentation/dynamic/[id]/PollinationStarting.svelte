<script lang="ts">
  import type { DisplayNewPollinatedSprout } from "$lib/events.types";

  export let contents: DisplayNewPollinatedSprout;
</script>

<div class="w-screen h-screen">
  <div
    class="w-screen h-screen flex text-center items-center justify-center text-roel_green text-7xl font-jeanb bg-roel_red"
  >
    STEVEB'S <br /> ROSE
  </div>

  <div
    class="bg-roel_green h-[560px] w-screen flex flex-col justify-end items-center relative"
  >
    <svg
      width="400"
      height="400"
      class="rotate-180 translate-y-[200px] fill-roel_red"
    >
      <path d="M0,200 a1,1 0 0,0 400,0" />
    </svg>
    <div
      class="absolute inset-0 flex items-center justify-center translate-y-[70px]"
    >
      <img
        src="/43.png"
        alt="Pollinating Plant First Parent"
        class="w-[400px]"
        crossorigin="anonymous"
      />
    </div>
  </div>

  <div class="absolute inset-0 flex items-center justify-center">
    <div
      class="bg-roel_green text-new_purple py-1 px-6 z-50 font-primerb text-3xl"
    >
      is pollinating with
    </div>
  </div>

  <div
    class="bg-new_purple h-[560px] flex flex-col justify-end items-center relative"
  >
    <svg width="400" height="400" class="translate-y-[-361px] fill-roel_rose">
      <path d="M0,200 a1,1 0 0,0 400,0" />
    </svg>
    <div
      class="absolute inset-0 flex items-center justify-center translate-y-[-70px]"
    >
      <img
        src="/58.png"
        alt="Pollinating Plant Second Parent"
        class="w-[400px] rotate-180"
        crossorigin="anonymous"
      />
    </div>
  </div>

  <div
    class="w-full h-[250px] flex text-center items-center justify-center absolute bottom-0 text-new_purple text-7xl font-jeanb bg-roel_rose"
  >
    ROELSCOOTER'S <br /> LAVENDER
  </div>
</div>

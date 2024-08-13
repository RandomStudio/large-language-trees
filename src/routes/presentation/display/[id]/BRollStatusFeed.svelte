<script lang="ts">
  import DisplayGarden from "./DisplayGarden.svelte";
  export let eventLogs;
  export let gardens;
</script>

<body class="bg-roel_purple min-h-screen">
  <div
    class="svg-container"
    style="position: absolute; height: 100vh; width: 100vw; overflow: hidden;"
  >
    <svg
      viewBox="0 0 1000 2400"
      preserveAspectRatio="none"
      style="width: 100%; height: 100%;"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1000 2900H1500V2400V700C1500 147.715 1052.28 -300 500 -300C-52.2848 -300 -500 147.715 -500 700V2400V2900H0H1000Z"
        class="stroke-roel_rose fill-roel_purple"
        stroke-width="1000"
      />
    </svg>
  </div>

  <div class="z-0">
    <DisplayGarden
      xGarden={0}
      yGarden={100}
      height={300}
      width={300}
      garden={gardens[0]}
      showGardenName={false}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={240}
      yGarden={300}
      height={300}
      width={300}
      garden={gardens[1]}
      showGardenName={false}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={0}
      yGarden={500}
      height={300}
      width={300}
      garden={gardens[2]}
      showGardenName={false}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={240}
      yGarden={700}
      height={300}
      width={300}
      garden={gardens[3]}
      showGardenName={false}
      innerwidth={window.innerWidth}
      innerheight={window.innerHeight}
    ></DisplayGarden>
  </div>

  <div class="absolute flex flex-col items-center bottom-3 z-20 w-full">
    <div class="items-start space-y-2">
      {#each eventLogs as sentence, index}
        <div
          class="flex items-center space-x-2"
          style="opacity: {0.5 + index * 0.1}"
        >
          {#each sentence as info}
            {#if info.highlight == true}
              <div
                class="text-roel_purple text-xl font-primer bg-roel_rose p-1"
              >
                {info.text}
              </div>
            {:else}
              <div class="text-xl font-primer text-roel_rose">{info.text}</div>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </div>
</body>

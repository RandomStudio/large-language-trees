<script lang="ts">
  import DisplayGarden from "./DisplayGarden.svelte";
  export let eventLogs;
  export let gardens;
</script>

<body class="bg-roel_purple min-h-screen">
  <svg
    width="540"
    height="1296"
    viewBox="0 0 1000 2400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1000 2900H1500V2400V700C1500 147.715 1052.28 -300 500 -300C-52.2848 -300 -500 147.715 -500 700V2400V2900H0H1000Z"
      stroke="#FFB6C1"
      stroke-width="1000"
    />
  </svg>
  <div class="z-0">
    <DisplayGarden
      xGarden={0}
      yGarden={100}
      height={300}
      width={300}
      garden={gardens[0]}
      showGardenName={false}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={240}
      yGarden={300}
      height={300}
      width={300}
      garden={gardens[1]}
      showGardenName={false}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={0}
      yGarden={500}
      height={300}
      width={300}
      garden={gardens[2]}
      showGardenName={false}
    ></DisplayGarden>
    <DisplayGarden
      xGarden={240}
      yGarden={700}
      height={300}
      width={300}
      garden={gardens[3]}
      showGardenName={false}
    ></DisplayGarden>
  </div>

  <div class="absolute left-3 bottom-3 space-y-2 z-20">
    {#each eventLogs as sentence, index}
      <div
        class="flex items-center space-x-2"
        style="opacity: {0.5 + index * 0.1}"
      >
        {#each sentence as info}
          {#if info.highlight == true}
            <div class="text-roel_purple text-xl font-primer bg-roel_rose p-1">
              {info.text}
            </div>
          {:else}
            <div class="text-xl font-primer text-roel_rose">{info.text}</div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
</body>

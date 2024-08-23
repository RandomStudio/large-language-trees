<script lang="ts">
  import DisplayGarden from "./DisplayGarden.svelte";
  export let eventLogs;
  export let gardens;
</script>

<div
  class="w-screen h-screen bg-gradient-to-t from-roel_blue from-30% to-roel_rose to-80%"
>
  <div class="z-[0] scale-150 translate-y-[-17vh] translate-x-[-5vh]">
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

  <div
    class="absolute flex flex-col items-start bottom-[2vh] z-[99999] w-full left-[2vh]"
  >
    <div class="items-start space-y-[2vh]">
      {#each eventLogs.slice().reverse() as sentence, index}
        <div
          class="flex items-center space-x-2"
          style="opacity: {0.0 + index * 0.2}"
        >
          {#each sentence as info}
            {#if info.highlight == true}
              <div
                class="text-roel_purple text-4xl font-primer bg-roel_rose px-2 max-w-[35vw] text-center pt-[1vw] pb-[1vw]"
              >
                {info.text}
              </div>
            {:else}
              <div class="text-4xl font-primer text-roel_rose">{info.text}</div>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

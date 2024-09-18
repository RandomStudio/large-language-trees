<script lang="ts">
  import NewUserFirstPlant from "./NewUserFirstPlant.svelte";
  import PollinationResult from "./PollinationResult.svelte";
  import BRollZoomOut from "./BRollZoomOut.svelte";

  import { onDestroy, onMount } from "svelte";
  import type { DisplayNotifyServer } from "../../../api/displayNotifyServer/types";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import StatsGrowingTime from "./StatsGrowingTime.svelte";
  import BRollStatusFeed from "./BRollStatusFeed.svelte";
  import BRollLeaderboard from "./BRollLeaderboard.svelte";
  import BRollPan from "./BRollPan.svelte";
  import StatsCount from "./StatsCount.svelte";
  import BRollDetail from "./BRollDetail.svelte";

  import { bRollNaming } from "$lib/events.types";
  import BRollDetailMulti from "./BRollDetailMulti.svelte";
  import StatsPollinations from "./StatsPollinations.svelte";

  import { fade } from "svelte/transition";

  import { FADE_DURATION, IDLE_TIMEOUT } from "$lib/constants";

  export let data;

  let agent: TetherAgent | null = null;

  let nextTimeout = Date.now();
  let intervalCheck: NodeJS.Timeout | null = null;

  const notifyServer = async (message: DisplayNotifyServer) => {
    console.log("Notify server that", data.id, "has timed out...");
    const res = await fetch("/api/displayNotifyServer", {
      method: "POST",
      body: JSON.stringify(message)
    });
    console.log(
      "...",
      Date.now(),
      "updated server with timeout notice",
      res.status
    );
  };

  onMount(async () => {
    notifyServer({
      event: "init",
      displayId: data.id
    });
    if (intervalCheck) {
      clearInterval(intervalCheck);
    }
    nextTimeout = Date.now() + IDLE_TIMEOUT;
    console.log("onMount set nextTimeout", nextTimeout);

    console.log("start interval timer");
    intervalCheck = setInterval(() => {
      if (Date.now() >= nextTimeout) {
        console.log("... Timeout", nextTimeout, "reached!");
        notifyServer({
          displayId: data.id,
          event: "timeout"
        });
      }
    }, 1000);

    // Subscribe to instructions channel
    agent = await TetherAgent.create("presentation", {
      brokerOptions: BROWSER_CONNECTION,
      id: data.id
    });
    const instructionsPlug = await InputPlug.create(
      agent,
      "serverInstructDisplays",
      { id: data.id }
    );
    instructionsPlug.on("message", (p) => {
      const m = decode(p) as DisplayUpdateMessage;
      console.log(Date.now(), "ReceivedserverInstructDisplays message:", m);
      const { payload, timeout } = m;
      data.coDisplayEventtents;

      if (timeout) {
        nextTimeout = Date.now() + timeout;
        console.log("update nextTimeout to", nextTimeout);
      }
    });
  });

  onDestroy(async () => {
    if (intervalCheck) {
      clearInterval(intervalCheck);
    }
    agent?.disconnect();
  });
</script>

<main class="container">
  {#if data.contents}
    {#if data.contents.name == "newUserFirstPlant"}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        <NewUserFirstPlant
          plant={data.contents.contents.plant}
          gardenerName={data.contents.contents.user.username}
        ></NewUserFirstPlant>
      </div>
    {/if}

    {#if data.contents.name == "newPlantPollination" && data.contents.contents.newPlant.imageUrl}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        <PollinationResult
          plantTop={data.contents.contents.plantTop}
          plantBottom={data.contents.contents.plantBottom}
          authorTop={data.contents.contents.authorTop}
          authorBottom={data.contents.contents.authorBottom}
          newPlant={data.contents.contents.newPlant}
        ></PollinationResult>
      </div>
    {/if}

    {#if data.contents.name == bRollNaming.STATUS_FEED}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        <BRollStatusFeed
          eventLogs={data.contents.contents.eventLogs}
          gardens={data.contents.contents.gardens}
        ></BRollStatusFeed>
      </div>
    {/if}

    {#if data.contents.name == bRollNaming.DETAIL}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        {#key data.contents.contents.plant.id}
          <BRollDetail
            plant={data.contents.contents.plant}
            user={data.contents.contents.user}
          ></BRollDetail>
        {/key}
      </div>
    {/if}

    {#if data.contents.name === bRollNaming.DETAIL_MULTI}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        {#key data.contents.contents}
          <BRollDetailMulti plantsWithusers={data.contents.contents} />
        {/key}
      </div>
    {/if}

    {#if data.contents.name == bRollNaming.ZOOM_OUT}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        <BRollZoomOut
          garden={data.contents.contents.garden}
          userName={data.contents.contents.user.username}
        ></BRollZoomOut>
      </div>
    {/if}

    {#if data.contents.name == bRollNaming.ROLL_PAN}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        <BRollPan gardens={data.contents}></BRollPan>
      </div>
    {/if}

    {#if data.contents.name == bRollNaming.TOP_LIST}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        <BRollLeaderboard
          topPollinators={data.contents.contents.topPollinators}
          topGarden={data.contents.contents.topGarden}
        ></BRollLeaderboard>
      </div>
    {/if}

    {#if data.contents.name == bRollNaming.STATISTICS_1}
      <div class="fixed top-0 left-0" transition:fade>
        {#key data.contents.contents.plant.imageUrl}
          <StatsGrowingTime
            imageUrl={data.contents.contents.plant.imageUrl || ""}
            plantName={data.contents.contents.plant.commonName}
            gardenerName={data.contents.contents.user.username}
            created={data.contents.contents.pollinationTimestamp}
          ></StatsGrowingTime>
        {/key}
      </div>
    {/if}

    {#if data.contents?.name == bRollNaming.STATISTICS_2}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        <StatsCount
          count={data.contents.contents.count}
          gardens={data.contents.contents.gardens}
        ></StatsCount>
      </div>
    {/if}

    {#if data.contents?.name == bRollNaming.STATISTICS_3}
      <div
        class="fixed top-0 left-0"
        transition:fade={{ duration: FADE_DURATION }}
      >
        {#key data.contents.contents.plant.id}
          <StatsPollinations
            plant={data.contents.contents.plant}
            pollinationCount={data.contents.contents.pollinationCount}
            user={data.contents.contents.user}
          ></StatsPollinations>
        {/key}
      </div>
    {/if}
  {/if}
</main>

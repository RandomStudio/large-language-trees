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
  import BRollLeaderboard from "../../fixed/leaderboard/+page.svelte";
  import BRollPan from "./BRollPan.svelte";
  import StatsCount from "./StatsCount.svelte";
  import BRollDetail from "./BRollDetail.svelte";

  import { DisplayEventNames, type DisplayEvent } from "$lib/events.types";
  import BRollDetailMulti from "./BRollDetailMulti.svelte";
  import StatsPollinations from "./StatsPollinations.svelte";

  import { fade } from "svelte/transition";

  import { FADE_DURATION, IDLE_TIMEOUT } from "$lib/constants";
  import PollinationStarting from "./PollinationStarting.svelte";

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
      const m = decode(p) as DisplayEvent;
      console.log(Date.now(), "ReceivedserverInstructDisplays message:", m);
      const { timeout } = m;
      data.event = m;

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
  <!-- <code>
    {JSON.stringify(data.event)}
  </code> -->
  {#if data.event}
    {#if data.event.name == DisplayEventNames.ANNOUNCE_FIRST_PLANT}
      <div transition:fade={{ duration: FADE_DURATION }}>
        <NewUserFirstPlant
          plant={data.event.payload.plant}
          gardenerName={data.event.payload.user.username}
        ></NewUserFirstPlant>
      </div>
    {/if}

    {#if data.event.name === DisplayEventNames.ANNOUNCE_POLLINATION_STARTING}
      <div transition:fade={{ duration: FADE_DURATION }}>
        <PollinationStarting
          authorTop={data.event.payload.authorTop}
          authorBottom={data.event.payload.authorBottom}
          plantTop={data.event.payload.plantTop}
          plantBottom={data.event.payload.plantBottom}
        />
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.ANNOUNCE_NEW_SPROUT}
      <div transition:fade={{ duration: FADE_DURATION }}>
        <PollinationResult
          authorTop={data.event.payload.authorTop}
          authorBottom={data.event.payload.authorBottom}
          newPlant={data.event.payload.newPlant}
        ></PollinationResult>
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.STATUS_FEED}
      <div transition:fade={{ duration: FADE_DURATION }}>
        <BRollStatusFeed
          eventLogs={data.event.payload.eventLogs}
          gardens={data.event.payload.gardens}
        ></BRollStatusFeed>
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.DETAIL}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload.plant.id}
          <BRollDetail
            plant={data.event.payload.plant}
            user={data.event.payload.user}
          ></BRollDetail>
        {/key}
      </div>
    {/if}

    {#if data.event.name === DisplayEventNames.DETAIL_MULTI}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload}
          <BRollDetailMulti plantsWithusers={data.event.payload} />
        {/key}
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.ZOOM_OUT}
      <div transition:fade={{ duration: FADE_DURATION }}>
        <BRollZoomOut
          garden={data.event.payload.garden}
          userName={data.event.payload.user.username}
        ></BRollZoomOut>
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.ROLL_PAN}
      <div transition:fade={{ duration: FADE_DURATION }}>
        <BRollPan gardens={data.event.payload}></BRollPan>
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.STATISTICS_1}
      <div transition:fade>
        {#key data.event.payload.plant.imageUrl}
          <StatsGrowingTime
            imageUrl={data.event.payload.plant.imageUrl || ""}
            plantName={data.event.payload.plant.commonName}
            gardenerName={data.event.payload.user.username}
            created={data.event.payload.pollinationTimestamp}
          ></StatsGrowingTime>
        {/key}
      </div>
    {/if}

    {#if data.event?.name == DisplayEventNames.STATISTICS_2}
      <div transition:fade={{ duration: FADE_DURATION }}>
        <StatsCount
          count={data.event.payload.count}
          gardens={data.event.payload.gardens}
        ></StatsCount>
      </div>
    {/if}

    {#if data.event?.name == DisplayEventNames.STATISTICS_3}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload.plant.id}
          <StatsPollinations
            plant={data.event.payload.plant}
            pollinationCount={data.event.payload.pollinationCount}
            user={data.event.payload.user}
          ></StatsPollinations>
        {/key}
      </div>
    {/if}
  {/if}
</main>
